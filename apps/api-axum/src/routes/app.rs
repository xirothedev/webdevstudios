use axum::extract::State;
use axum::http::header;
use axum::response::{IntoResponse, Response};
use axum::routing::get;
use axum::Json;
use serde_json::json;

use crate::extractors::AuthUser;
use crate::state::AppState;

pub fn routes() -> axum::Router<AppState> {
    axum::Router::new()
        .route("/", get(root))
        .route("/csrf-token", get(csrf_token))
}

async fn root(_user: AuthUser, _state: State<AppState>) -> Response {
    crate::error::nest_ok("Hello World!", "/v1")
}

async fn csrf_token(state: State<AppState>) -> Response {
    let token = state.csrf.new_token();
    let cookie = state.csrf.cookie_header(&token);
    let mut res = Json(json!({ "csrfToken": token })).into_response();
    let value = header::HeaderValue::from_str(&cookie).expect("valid cookie chars");
    let _ = res.headers_mut().append(header::SET_COOKIE, value);
    res
}
