pub mod app;

use axum::extract::Path;
use axum::http::{header, HeaderName, HeaderValue, Method, StatusCode};
use axum::response::Response;
use axum::Router;
use tower_http::cors::{AllowHeaders, AllowMethods, AllowOrigin, CorsLayer};
use tower_http::trace::TraceLayer;

use crate::csrf;
use crate::error::nest_error;
use crate::state::AppState;

pub fn build(state: AppState) -> Router {
    let cors = CorsLayer::new()
        .allow_origin(AllowOrigin::list(parse_origins(&state.cfg.cors_origin)))
        .allow_methods(AllowMethods::list([
            Method::GET,
            Method::POST,
            Method::PUT,
            Method::PATCH,
            Method::DELETE,
            Method::OPTIONS,
        ]))
        .allow_headers(AllowHeaders::list([
            header::CONTENT_TYPE,
            header::AUTHORIZATION,
            header::ACCEPT,
            HeaderName::from_static("x-requested-with"),
            HeaderName::from_static("x-csrf-token"),
        ]))
        .expose_headers([header::CONTENT_TYPE, header::AUTHORIZATION])
        .allow_credentials(true);

    Router::new()
        .nest("/v1", app::routes())
        .fallback(not_found)
        .layer(axum::middleware::from_fn_with_state(state.csrf.clone(), csrf::guard))
        .layer(cors)
        .layer(TraceLayer::new_for_http())
        .with_state(state)
}

fn parse_origins(raw: &str) -> Vec<HeaderValue> {
    raw.split(',')
        .map(|s| s.trim())
        .filter(|s| !s.is_empty())
        .filter_map(|s| s.parse().ok())
        .collect()
}

async fn not_found(method: Method, Path(path): Path<String>) -> Response {
    nest_error(StatusCode::NOT_FOUND, format!("Cannot {method} {path}"), &path, None)
}
