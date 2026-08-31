// ponytail: error helpers for next slices — allow until routes use them
#![allow(dead_code)]
use axum::http::StatusCode;
use axum::response::{IntoResponse, Response};
use axum::Json;
use serde_json::{json, Value};

#[derive(Debug, thiserror::Error)]
pub enum ApiError {
    #[error("{0}")]
    Http(StatusCode, String),
}

impl ApiError {
    pub fn unauthorized(msg: impl Into<String>) -> Self {
        Self::Http(StatusCode::UNAUTHORIZED, msg.into())
    }
    pub fn internal(msg: impl Into<String>) -> Self {
        Self::Http(StatusCode::INTERNAL_SERVER_ERROR, msg.into())
    }

    pub fn throttle() -> Self {
        Self::Http(
            StatusCode::TOO_MANY_REQUESTS,
            "ThrottlerException: Too Many Requests".into(),
        )
    }
}

pub fn nest_error(
    status: StatusCode,
    message: String,
    path: &str,
    details: Option<Value>,
) -> Response {
    let body = json!({
        "success": false,
        "data": null,
        "message": message,
        "error": error_name(status),
        "statusCode": status.as_u16(),
        "timestamp": chrono_now_iso(),
        "path": path,
    });
    let body = match details {
        Some(d) => body
            .as_object()
            .cloned()
            .map(|mut o| {
                o.insert("details".into(), d);
                Value::Object(o)
            })
            .unwrap_or(body),
        None => body,
    };
    (status, Json(body)).into_response()
}

fn error_name(status: StatusCode) -> &'static str {
    match status.as_u16() {
        400 => "BadRequestException",
        401 => "UnauthorizedException",
        403 => "ForbiddenException",
        404 => "NotFoundException",
        409 => "ConflictException",
        429 => "ThrottlerException",
        _ => "InternalServerErrorException",
    }
}

fn chrono_now_iso() -> String {
    chrono::Utc::now().to_rfc3339_opts(chrono::SecondsFormat::Secs, true)
}

impl IntoResponse for ApiError {
    fn into_response(self) -> Response {
        let Self::Http(status, message) = self;
        nest_error(status, message, "/", None)
    }
}

pub fn nest_ok<T: serde::Serialize>(data: T, path: &str) -> Response {
    let body = json!({
        "success": true,
        "data": serde_json::to_value(&data).unwrap_or(Value::Null),
        "timestamp": chrono_now_iso(),
        "path": path,
    });
    Json(body).into_response()
}

#[cfg(test)]
mod tests {
    use super::*;
    use axum::http::StatusCode;

    #[test]
    fn error_name_maps_status() {
        assert_eq!(error_name(StatusCode::BAD_REQUEST), "BadRequestException");
        assert_eq!(error_name(StatusCode::UNAUTHORIZED), "UnauthorizedException");
        assert_eq!(error_name(StatusCode::FORBIDDEN), "ForbiddenException");
        assert_eq!(error_name(StatusCode::NOT_FOUND), "NotFoundException");
        assert_eq!(error_name(StatusCode::CONFLICT), "ConflictException");
        assert_eq!(error_name(StatusCode::TOO_MANY_REQUESTS), "ThrottlerException");
        assert_eq!(error_name(StatusCode::INTERNAL_SERVER_ERROR), "InternalServerErrorException");
    }

    #[test]
    fn chrono_now_iso_is_rfc3339_utc() {
        let s = chrono_now_iso();
        assert!(s.ends_with('Z'));
        // should parse as RFC3339
        let dt = chrono::DateTime::parse_from_rfc3339(&s).expect("valid rfc3339");
        assert_eq!(dt.offset().local_minus_utc(), 0);
    }

    #[tokio::test]
    async fn nest_error_envelope_shape() {
        let res = nest_error(StatusCode::NOT_FOUND, "not here".into(), "/v1/test", None);
        assert_eq!(res.status(), StatusCode::NOT_FOUND);
        let body = axum::body::to_bytes(res.into_body(), 1024 * 1024).await.unwrap();
        let v: Value = serde_json::from_slice(&body).unwrap();
        assert_eq!(v["success"], false);
        assert_eq!(v["data"], Value::Null);
        assert_eq!(v["message"], "not here");
        assert_eq!(v["error"], "NotFoundException");
        assert_eq!(v["statusCode"], 404);
        assert_eq!(v["path"], "/v1/test");
        assert!(v["timestamp"].is_string());
    }

    #[tokio::test]
    async fn nest_error_with_details_includes_details_field() {
        let details = json!({"field": "email", "issue": "taken"});
        let res = nest_error(StatusCode::BAD_REQUEST, "bad".into(), "/v1/users", Some(details.clone()));
        let body = axum::body::to_bytes(res.into_body(), 1024 * 1024).await.unwrap();
        let v: Value = serde_json::from_slice(&body).unwrap();
        assert_eq!(v["details"], details);
    }

    #[tokio::test]
    async fn nest_ok_envelope_shape() {
        let res = nest_ok(json!({"id": "123"}), "/v1/orders");
        assert_eq!(res.status(), StatusCode::OK);
        let body = axum::body::to_bytes(res.into_body(), 1024 * 1024).await.unwrap();
        let v: Value = serde_json::from_slice(&body).unwrap();
        assert_eq!(v["success"], true);
        assert_eq!(v["data"]["id"], "123");
        assert_eq!(v["path"], "/v1/orders");
        assert!(v["timestamp"].is_string());
    }

    #[tokio::test]
    async fn api_error_into_response_uses_nest_error() {
        let res = ApiError::unauthorized("Unauthorized").into_response();
        assert_eq!(res.status(), StatusCode::UNAUTHORIZED);
        let body = axum::body::to_bytes(res.into_body(), 1024 * 1024).await.unwrap();
        let v: Value = serde_json::from_slice(&body).unwrap();
        assert_eq!(v["error"], "UnauthorizedException");
    }

    #[test]
    fn throttle_error_has_correct_message_and_status() {
        let e = ApiError::throttle();
        match e {
            ApiError::Http(status, msg) => {
                assert_eq!(status, StatusCode::TOO_MANY_REQUESTS);
                assert_eq!(msg, "ThrottlerException: Too Many Requests");
            }
        }
    }
}
