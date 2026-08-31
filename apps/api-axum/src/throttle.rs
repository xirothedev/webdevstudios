// ponytail: throttle scaffolding for upcoming rate-limit middleware — allow until wired
#![allow(dead_code)]
use redis::aio::MultiplexedConnection;
use redis::AsyncCommands;

use crate::error::ApiError;

#[derive(Clone, Copy)]
pub struct Limiter {
    name: &'static str,
    limit: u64,
    ttl_secs: u64,
}

impl Limiter {
    pub const SHORT: Self = Self { name: "short", limit: 3, ttl_secs: 1 };
    pub const MEDIUM: Self = Self { name: "medium", limit: 20, ttl_secs: 10 };
    pub const LONG: Self = Self { name: "long", limit: 100, ttl_secs: 60 };
    pub const PASSWORD_RESET: Self = Self {
        name: "password_reset",
        limit: 3,
        ttl_secs: 3600,
    };
}

#[derive(Clone)]
pub struct Throttle {
    conn: Option<MultiplexedConnection>,
}

impl Throttle {
    pub async fn new(client: Option<redis::Client>) -> Self {
        Self {
            conn: match client {
                Some(client) => client.get_multiplexed_async_connection().await.ok(),
                None => None,
            },
        }
    }

    // ponytail: fixed window keyed by route+ip; degrades open when Redis is down (matches Nest storage failure)
    pub async fn check(&self, limiter: &Limiter, route: &str, ip: &str) -> Result<(), ApiError> {
        let Some(mut conn) = self.conn.clone() else {
            return Ok(());
        };
        let now = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_secs();
        let route = route.split('?').next().unwrap_or(route);
        let key = format!("throttle:{}:{}:{}:{}", limiter.name, route, ip, now / limiter.ttl_secs);
        let count: isize = match conn.incr(&key, 1).await {
            Ok(count) => count,
            Err(_) => return Ok(()),
        };
        if count == 1 {
            let _ = conn.expire::<_, bool>(&key, limiter.ttl_secs as i64).await;
        }
        if count as u64 > limiter.limit {
            return Err(ApiError::throttle());
        }
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn limiter_constants_match_spec() {
        assert_eq!(Limiter::SHORT.name, "short");
        assert_eq!(Limiter::SHORT.limit, 3);
        assert_eq!(Limiter::SHORT.ttl_secs, 1);
        assert_eq!(Limiter::MEDIUM.name, "medium");
        assert_eq!(Limiter::MEDIUM.limit, 20);
        assert_eq!(Limiter::MEDIUM.ttl_secs, 10);
        assert_eq!(Limiter::LONG.name, "long");
        assert_eq!(Limiter::LONG.limit, 100);
        assert_eq!(Limiter::LONG.ttl_secs, 60);
        assert_eq!(Limiter::PASSWORD_RESET.name, "password_reset");
        assert_eq!(Limiter::PASSWORD_RESET.limit, 3);
        assert_eq!(Limiter::PASSWORD_RESET.ttl_secs, 3600);
    }

    #[tokio::test]
    async fn throttle_degrades_open_without_redis() {
        let t = Throttle::new(None).await;
        // without redis, every check passes (matches Nest storage failure)
        for limiter in [
            Limiter::SHORT,
            Limiter::MEDIUM,
            Limiter::LONG,
            Limiter::PASSWORD_RESET,
        ] {
            assert!(t.check(&limiter, "/v1/auth/login", "127.0.0.1").await.is_ok());
            assert!(t.check(&limiter, "/v1/orders", "10.0.0.1").await.is_ok());
        }
    }

    #[tokio::test]
    async fn throttle_degrades_open_on_redis_error() {
        // invalid redis url → Throttle::new returns None conn, degrades open
        let client = redis::Client::open("redis://127.0.0.1:6399/").ok();
        let t = Throttle::new(client).await;
        // connection will fail (no server), but Throttle::new already .ok() → None, so degrades
        // if by chance it connects, incr will fail and check also degrades open
        let res = t.check(&Limiter::SHORT, "/v1/test", "1.2.3.4").await;
        assert!(res.is_ok());
    }

    #[test]
    fn limiter_names_are_distinct_for_key_isolation() {
        let names = [
            Limiter::SHORT.name,
            Limiter::MEDIUM.name,
            Limiter::LONG.name,
            Limiter::PASSWORD_RESET.name,
        ];
        let mut uniq = std::collections::HashSet::new();
        for n in names {
            assert!(uniq.insert(n), "duplicate limiter name: {n}");
        }
    }
}
