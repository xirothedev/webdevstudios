#[derive(Clone, Debug)]
pub struct Config {
    pub port: u16,
    pub database_url: Option<String>,
    pub redis_url: Option<String>,
    pub jwt_secret_key: String,
    pub csrf_secret: String,
    pub cors_origin: String,
    pub frontend_url: String,
    pub mail_user: Option<String>,
    pub mail_pass: Option<String>,
    pub payos_client_id: Option<String>,
    pub payos_api_key: Option<String>,
    pub payos_checksum_key: Option<String>,
    pub payos_return_url: String,
    pub payos_cancel_url: String,
    pub r2_account_id: Option<String>,
    pub r2_access_key_id: Option<String>,
    pub r2_secret_access_key: Option<String>,
    pub r2_bucket_name: Option<String>,
    pub r2_public_url: Option<String>,
    pub r2_endpoint: Option<String>,
}

impl Config {
    pub fn from_env() -> Self {
        Config {
            port: env_or("PORT", "4003").parse().unwrap_or(4003),
            database_url: env("DATABASE_URL"),
            redis_url: env("REDIS_URL").or_else(|| {
                let host = env("REDIS_HOST");
                let port = env_or("REDIS_PORT", "6379");
                host.map(|h| format!("redis://{h}:{port}"))
            }),
            jwt_secret_key: env_or("JWT_SECRET_KEY", "dev-secret-change-me"),
            csrf_secret: env_or("CSRF_SECRET", "dev-csrf-secret"),
            cors_origin: env_or("CORS_ORIGIN", "http://localhost:3000"),
            frontend_url: env_or("FRONTEND_URL", "http://localhost:3000"),
            mail_user: env("MAIL_USER"),
            mail_pass: env("MAIL_PASS"),
            payos_client_id: env("PAYOS_CLIENT_ID"),
            payos_api_key: env("PAYOS_API_KEY"),
            payos_checksum_key: env("PAYOS_CHECKSUM_KEY"),
            payos_return_url: env_or("PAYOS_RETURN_URL", ""),
            payos_cancel_url: env_or("PAYOS_CANCEL_URL", ""),
            r2_account_id: env("R2_ACCOUNT_ID"),
            r2_access_key_id: env("R2_ACCESS_KEY_ID"),
            r2_secret_access_key: env("R2_SECRET_ACCESS_KEY"),
            r2_bucket_name: env("R2_BUCKET_NAME"),
            r2_public_url: env("R2_PUBLIC_URL"),
            r2_endpoint: env("R2_ENDPOINT"),
        }
    }

    pub fn is_production(&self) -> bool {
        std::env::var("NODE_ENV").as_deref() == Ok("production")
    }

    pub fn r2_enabled(&self) -> bool {
        self.r2_account_id.is_some()
            && self.r2_access_key_id.is_some()
            && self.r2_secret_access_key.is_some()
            && self.r2_bucket_name.is_some()
    }

    pub fn payos_enabled(&self) -> bool {
        self.payos_client_id.is_some()
            && self.payos_api_key.is_some()
            && self.payos_checksum_key.is_some()
    }

    pub fn r2_endpoint_url(&self) -> Option<String> {
        self.r2_endpoint.clone().or_else(|| {
            self.r2_account_id
                .as_ref()
                .map(|id| format!("https://{id}.r2.cloudflarestorage.com"))
        })
    }
}

fn env(key: &str) -> Option<String> {
    std::env::var(key).ok().filter(|v| !v.is_empty())
}

fn env_or(key: &str, default: &str) -> String {
    env(key).unwrap_or_else(|| default.to_string())
}
