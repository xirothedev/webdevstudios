use std::sync::Arc;

use axum::extract::{Request, State};
use axum::http::{header, Method, StatusCode};
use axum::middleware::Next;
use axum::response::Response;
use hmac::{Hmac, Mac};
use rand::RngCore;
use sha2::Sha256;

use crate::error::nest_error;

type HmacSha256 = Hmac<Sha256>;

#[derive(Clone)]
pub struct Csrf {
    secret: Arc<Vec<u8>>,
    secure: bool,
}

impl Csrf {
    pub fn new(secret: &str, secure: bool) -> Self {
        Self {
            secret: secret.as_bytes().to_vec().into(),
            secure,
        }
    }

    pub fn new_token(&self) -> String {
        let mut random = [0u8; 32];
        rand::rngs::OsRng.fill_bytes(&mut random);
        let random_hex = hex::encode(random);
        let mut mac = HmacSha256::new_from_slice(&self.secret).expect("hmac accepts any key size");
        mac.update(random_hex.as_bytes());
        format!("{}.{}", hex::encode(mac.finalize().into_bytes()), random_hex)
    }

    pub fn valid(&self, token: &str) -> bool {
        let Some((mac_part, random)) = token.split_once('.') else {
            return false;
        };
        if mac_part.is_empty() || random.is_empty() {
            return false;
        }
        let mut mac = HmacSha256::new_from_slice(&self.secret).expect("hmac accepts any key size");
        mac.update(random.as_bytes());
        let expected = hex::encode(mac.finalize().into_bytes());
        const_time_eq(&expected, mac_part)
    }

    pub fn cookie_header(&self, token: &str) -> String {
        let mut cookie = format!("_csrf={token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=3600");
        if self.secure {
            cookie.push_str("; Secure");
        }
        cookie
    }
}

fn const_time_eq(a: &str, b: &str) -> bool {
    if a.len() != b.len() {
        return false;
    }
    let mut diff = 0u8;
    for (x, y) in a.bytes().zip(b.bytes()) {
        diff |= x ^ y;
    }
    diff == 0
}

fn read_csrf_cookie(req: &Request) -> Option<String> {
    let raw = req.headers().get(header::COOKIE)?.to_str().ok()?;
    for part in raw.split(';') {
        if let Some((name, value)) = part.trim().split_once('=') {
            if name.trim() == "_csrf" {
                return Some(value.trim().to_string());
            }
        }
    }
    None
}

fn is_exempt(method: &Method, path: &str) -> bool {
    matches!(*method, Method::GET | Method::HEAD | Method::OPTIONS)
        || path.starts_with("/v1/auth/oauth")
        || path.starts_with("/v1/payments/webhook")
        || path.starts_with("/v1/docs")
        || path == "/v1/auth/refresh"
}

pub async fn guard(State(csrf): State<Csrf>, req: Request, next: Next) -> Result<Response, Response> {
    let path = req.uri().path().to_string();
    let method = req.method();
    let plant_cookie = read_csrf_cookie(&req).is_none();
    let new_token = if plant_cookie { Some(csrf.new_token()) } else { None };

    if is_exempt(method, &path) {
        let mut res = next.run(req).await;
        if let Some(token) = new_token {
            let value = header::HeaderValue::from_str(&csrf.cookie_header(&token)).expect("valid cookie chars");
            let _ = res.headers_mut().append(header::SET_COOKIE, value);
        }
        return Ok(res);
    }

    let token = req
        .headers()
        .get("X-CSRF-Token")
        .and_then(|value| value.to_str().ok())
        .unwrap_or("");
    let cookie = read_csrf_cookie(&req).unwrap_or_default();
    let valid = !token.is_empty() && const_time_eq(token, &cookie) && csrf.valid(token);

    let mut res = if valid {
        next.run(req).await
    } else {
        nest_error(StatusCode::FORBIDDEN, "Invalid CSRF token".into(), &path, None)
    };

    if let Some(token) = new_token {
        let value = header::HeaderValue::from_str(&csrf.cookie_header(&token)).expect("valid cookie chars");
        let _ = res.headers_mut().append(header::SET_COOKIE, value);
    }

    Ok(res)
}

#[cfg(test)]
mod tests {
    use super::*;
    use axum::http::Method;

    #[test]
    fn new_token_is_valid_and_unique() {
        let csrf = Csrf::new("test-secret-32chars-long-for-csrf", false);
        let t1 = csrf.new_token();
        let t2 = csrf.new_token();
        assert!(t1.contains('.'));
        assert!(csrf.valid(&t1));
        assert!(csrf.valid(&t2));
        assert_ne!(t1, t2);
    }

    #[test]
    fn valid_rejects_malformed_and_wrong_secret() {
        let csrf = Csrf::new("secret-a-32chars-long-for-csrf-ok", false);
        let other = Csrf::new("secret-b-32chars-long-for-csrf-ok", false);
        let token = csrf.new_token();
        assert!(!csrf.valid(""));
        assert!(!csrf.valid("no-dot"));
        assert!(!csrf.valid(".only-random"));
        assert!(!csrf.valid("only-mac."));
        assert!(!csrf.valid("deadbeef.0123"));
        assert!(!other.valid(&token));
        // tamper random part
        let mut tampered = token.clone();
        tampered.push('x');
        assert!(!csrf.valid(&tampered));
    }

    #[test]
    fn cookie_header_format_and_secure_flag() {
        let csrf = Csrf::new("s", false);
        let h = csrf.cookie_header("tok.val");
        assert_eq!(h, "_csrf=tok.val; Path=/; HttpOnly; SameSite=Lax; Max-Age=3600");
        let csrf_sec = Csrf::new("s", true);
        assert!(csrf_sec.cookie_header("x").ends_with("; Secure"));
    }

    #[test]
    fn const_time_eq_is_constant_time_and_correct() {
        assert!(const_time_eq("abc", "abc"));
        assert!(!const_time_eq("abc", "abd"));
        assert!(!const_time_eq("abc", "ab"));
        assert!(const_time_eq("", ""));
    }

    #[test]
    fn read_csrf_cookie_extracts_csrf_value() {
        let req = axum::http::Request::builder()
            .header(header::COOKIE, "a=1; _csrf=my-token-123; b=2")
            .body(axum::body::Body::empty())
            .unwrap();
        assert_eq!(read_csrf_cookie(&req).as_deref(), Some("my-token-123"));
        let req2 = axum::http::Request::builder()
            .header(header::COOKIE, "a=1; b=2")
            .body(axum::body::Body::empty())
            .unwrap();
        assert!(read_csrf_cookie(&req2).is_none());
        let req3 = axum::http::Request::builder()
            .body(axum::body::Body::empty())
            .unwrap();
        assert!(read_csrf_cookie(&req3).is_none());
    }

    #[test]
    fn is_exempt_covers_methods_and_paths() {
        // methods
        assert!(is_exempt(&Method::GET, "/v1/orders"));
        assert!(is_exempt(&Method::HEAD, "/v1/orders"));
        assert!(is_exempt(&Method::OPTIONS, "/v1/orders"));
        assert!(!is_exempt(&Method::POST, "/v1/orders"));
        assert!(!is_exempt(&Method::PUT, "/v1/orders"));
        // path prefixes
        assert!(is_exempt(&Method::POST, "/v1/auth/oauth/google"));
        assert!(is_exempt(&Method::POST, "/v1/payments/webhook"));
        assert!(is_exempt(&Method::POST, "/v1/docs/swagger"));
        assert!(!is_exempt(&Method::POST, "/v1/auth/login"));
        // exact
        assert!(is_exempt(&Method::POST, "/v1/auth/refresh"));
        assert!(!is_exempt(&Method::POST, "/v1/auth/refresh/extra"));
    }
}
