mod auth;
mod config;
mod cookies;
mod csrf;
mod db;
mod entities;
mod error;
mod extractors;
mod mailer;
mod payos;
mod routes;
mod state;
mod storage;
mod sweep;
mod throttle;

use std::net::SocketAddr;

#[tokio::main]
async fn main() {
    dotenvy::dotenv().ok();
    tracing_subscriber::fmt::init();

    let cfg = config::Config::from_env();
    let state = state::AppState::new(&cfg).await;

    if let Some(db) = state.db.clone() {
        tokio::spawn(async move {
            let mut interval = tokio::time::interval(sweep::SWEEP_INTERVAL);
            interval.tick().await; // consume immediate tick
            loop {
                interval.tick().await;
                sweep::sweep_expired(&db).await;
            }
        });
    }

    let addr = SocketAddr::from(([0, 0, 0, 0], state.cfg.port));
    let app = routes::build(state);
    let listener = tokio::net::TcpListener::bind(addr).await.expect("bind failed");
    tracing::info!(?addr, "listening");
    axum::serve(listener, app.into_make_service_with_connect_info::<SocketAddr>()).await.ok();
}
