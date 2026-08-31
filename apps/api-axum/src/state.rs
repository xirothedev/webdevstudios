// ponytail: AppState holds scaffolding clients for next slices — allow until routes read them
#![allow(dead_code)]
use std::sync::Arc;

use redis::Client;
use sea_orm::DatabaseConnection;

use crate::config::Config;
use crate::csrf::Csrf;
use crate::mailer::Mailer;
use crate::payos::PayosClient;
use crate::storage::StorageClient;
use crate::throttle::Throttle;

#[derive(Clone)]
pub struct AppState {
    pub db: Option<DatabaseConnection>,
    pub redis: Option<Client>,
    pub mailer: Mailer,
    pub storage: Option<Arc<StorageClient>>,
    pub payos: Option<Arc<PayosClient>>,
    pub csrf: Csrf,
    pub throttle: Throttle,
    pub cfg: Config,
}

impl AppState {
    pub async fn new(cfg: &Config) -> Self {
        let db = match &cfg.database_url {
            Some(url) => match crate::db::connect(url).await {
                Ok(conn) => Some(conn),
                Err(error) => {
                    tracing::warn!(error = %error, "database unavailable; continuing without db");
                    None
                }
            },
            None => None,
        };
        let redis = match &cfg.redis_url {
            Some(url) => match Client::open(url.as_str()) {
                Ok(client) => Some(client),
                Err(error) => {
                    tracing::warn!(error = %error, "redis unavailable; continuing without redis");
                    None
                }
            },
            None => None,
        };
        let throttle = Throttle::new(redis.clone()).await;
        Self {
            db,
            redis,
            mailer: Mailer::new(cfg),
            storage: storage_client(cfg).await.map(Arc::new),
            payos: payos_client(cfg).map(Arc::new),
            csrf: Csrf::new(&cfg.csrf_secret, cfg.is_production()),
            throttle,
            cfg: cfg.clone(),
        }
    }
}

async fn storage_client(cfg: &Config) -> Option<StorageClient> {
    if !cfg.r2_enabled() {
        return None;
    }
    Some(
        StorageClient::new(
            cfg.r2_endpoint_url().as_deref().unwrap_or(""),
            cfg.r2_access_key_id.as_deref().unwrap_or(""),
            cfg.r2_secret_access_key.as_deref().unwrap_or(""),
            cfg.r2_bucket_name.as_deref().unwrap_or(""),
            cfg.r2_public_url.as_deref().unwrap_or(""),
        )
        .await,
    )
}

fn payos_client(cfg: &Config) -> Option<PayosClient> {
    if !cfg.payos_enabled() {
        return None;
    }
    Some(PayosClient::new(
        cfg.payos_client_id.as_deref().unwrap_or(""),
        cfg.payos_api_key.as_deref().unwrap_or(""),
        cfg.payos_checksum_key.as_deref().unwrap_or(""),
        &cfg.payos_return_url,
        &cfg.payos_cancel_url,
    ))
}
