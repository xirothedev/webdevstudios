// ponytail: AuthUser fields for upcoming admin routes — allow until handlers read them
#![allow(dead_code)]
use axum::extract::FromRequestParts;
use axum::http::{header, request::Parts};
use jsonwebtoken::{decode, Algorithm, DecodingKey, Validation};
use sea_orm::EntityTrait;

use crate::auth::AccessClaims;
use crate::entities::sea_orm_active_enums::UserRole;
use crate::entities::users;
use crate::error::ApiError;
use crate::state::AppState;

pub struct AuthUser {
    pub id: String,
    pub email: String,
    pub role: UserRole,
    pub session_id: Option<String>,
}

impl FromRequestParts<AppState> for AuthUser {
    type Rejection = ApiError;

    async fn from_request_parts(
        parts: &mut Parts,
        state: &AppState,
    ) -> Result<Self, Self::Rejection> {
        let token = crate::cookies::parse_cookies(
            parts
                .headers
                .get(header::COOKIE)
                .and_then(|v| v.to_str().ok()),
        )
        .get("access_token")
        .cloned()
        .or_else(|| {
            parts
                .headers
                .get(header::AUTHORIZATION)
                .and_then(|v| v.to_str().ok())
                .and_then(|v| v.strip_prefix("Bearer "))
                .map(|v| v.to_string())
        });
        let Some(token) = token else {
            return Err(ApiError::unauthorized("Unauthorized"));
        };
        let key = DecodingKey::from_secret(state.cfg.jwt_secret_key.as_bytes());
        let claims: AccessClaims = match decode(&token, &key, &Validation::new(Algorithm::HS256)) {
            Ok(decoded) => decoded.claims,
            Err(_) => return Err(ApiError::unauthorized("Unauthorized")),
        };
        let Some(db) = &state.db else {
            return Err(ApiError::internal("Database unavailable"));
        };
        let user = match users::Entity::find_by_id(&claims.sub).one(db).await {
            Ok(Some(user)) => user,
            Ok(None) => return Err(ApiError::unauthorized("User not found")),
            Err(_) => return Err(ApiError::internal("Database error")),
        };
        Ok(AuthUser {
            id: user.id,
            email: user.email,
            role: user.role,
            session_id: claims.jti,
        })
    }
}
