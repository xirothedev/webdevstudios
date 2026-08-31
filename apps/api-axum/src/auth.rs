// ponytail: auth scaffolding for User/Session/MFA — allow until routes wire Jwt/hash/totp
#![allow(dead_code)]
use argon2::password_hash::{
    rand_core::OsRng, PasswordHash, PasswordHasher, PasswordVerifier, SaltString,
};
use argon2::Argon2;
use jsonwebtoken::{decode, encode, Algorithm, DecodingKey, EncodingKey, Header, Validation};
use rand::RngCore;
use std::time::{SystemTime, UNIX_EPOCH};
use totp_rs::Secret;

#[derive(Debug, serde::Serialize, serde::Deserialize)]
pub struct AccessClaims {
    pub sub: String,
    pub email: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub role: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub jti: Option<String>,
    pub exp: i64,
    pub iat: i64,
}

#[derive(Debug, serde::Serialize, serde::Deserialize)]
pub struct RefreshClaims {
    pub sub: String,
    pub exp: i64,
    pub iat: i64,
}

pub struct Jwt {
    key: EncodingKey,
    secret: Vec<u8>,
    pub access_ttl_secs: i64,
    pub refresh_ttl_secs: i64,
}

impl Jwt {
    pub fn new(secret: &str, access_ttl_secs: i64, refresh_ttl_secs: i64) -> Self {
        Self {
            key: EncodingKey::from_secret(secret.as_bytes()),
            secret: secret.as_bytes().to_vec(),
            access_ttl_secs,
            refresh_ttl_secs,
        }
    }

    pub fn issue_access(&self, sub: &str, email: &str, role: &str, jti: Option<String>) -> String {
        let now = now_secs();
        let claims = AccessClaims {
            sub: sub.into(),
            email: email.into(),
            role: Some(role.into()),
            jti,
            exp: now + self.access_ttl_secs,
            iat: now,
        };
        encode(&Header::new(Algorithm::HS256), &claims, &self.key).expect("jwt encode")
    }

    pub fn issue_refresh(&self, sub: &str) -> String {
        let now = now_secs();
        let claims = RefreshClaims {
            sub: sub.into(),
            exp: now + self.refresh_ttl_secs,
            iat: now,
        };
        encode(&Header::new(Algorithm::HS256), &claims, &self.key).expect("jwt encode")
    }

    pub fn verify_access(&self, token: &str) -> Result<AccessClaims, jsonwebtoken::errors::Error> {
        let mut v = Validation::new(Algorithm::HS256);
        v.leeway = 60;
        verify_hs256_secret(&self.secret, token, &v)
    }

    pub fn verify_refresh(
        &self,
        token: &str,
    ) -> Result<RefreshClaims, jsonwebtoken::errors::Error> {
        let v = Validation::new(Algorithm::HS256);
        verify_hs256_secret(&self.secret, token, &v)
    }
}

fn verify_hs256_secret<C: serde::de::DeserializeOwned>(
    secret: &[u8],
    token: &str,
    v: &Validation,
) -> Result<C, jsonwebtoken::errors::Error> {
    decode::<C>(token, &DecodingKey::from_secret(secret), v).map(|d| d.claims)
}

fn now_secs() -> i64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_secs() as i64)
        .unwrap_or(0)
}

// ponytail: secret passed via &self in real usage; helper kept minimal for tests
pub fn sign_hs256(secret: &str, claims: &impl serde::Serialize) -> String {
    let key = EncodingKey::from_secret(secret.as_bytes());
    encode(&Header::new(Algorithm::HS256), claims, &key).unwrap()
}

pub fn verify_hs256<C: serde::de::DeserializeOwned>(secret: &str, token: &str) -> Option<C> {
    let key = DecodingKey::from_secret(secret.as_bytes());
    let mut v = Validation::new(Algorithm::HS256);
    v.leeway = 0;
    decode::<C>(token, &key, &v).ok().map(|d| d.claims)
}

pub fn hash_password(password: &str) -> Result<String, argon2::password_hash::Error> {
    let salt = SaltString::generate(&mut OsRng);
    let hash = Argon2::default()
        .hash_password(password.as_bytes(), &salt)?
        .to_string();
    Ok(hash)
}

pub fn verify_password(hash: &str, password: &str) -> bool {
    let Ok(parsed) = PasswordHash::new(hash) else {
        return false;
    };
    Argon2::default()
        .verify_password(password.as_bytes(), &parsed)
        .is_ok()
}

pub fn random_hex(n_bytes: usize) -> String {
    let mut bytes = vec![0u8; n_bytes.min(64)];
    OsRng.fill_bytes(&mut bytes);
    hex::encode(&bytes)
}

// --- TOTP ---
// ponytail: totp-rs 6.0 (SHA1/6 digits/30s/skew=2 mirrors speakeasy window:2);
// QR via its `qr` feature instead of a separate qrcode crate.

pub fn totp_secret_base32() -> String {
    Secret::generate().to_base32()
}

fn build_totp(secret_b32: &str, email: &str) -> Result<totp_rs::Totp, String> {
    let secret =
        Secret::try_from_base32(secret_b32).map_err(|_| "invalid TOTP secret".to_string())?;
    totp_rs::Builder::new()
        .with_secret(secret)
        .with_digits(6)
        .with_step_duration(30)
        .with_skew(2)
        .with_account_name(email.to_string())
        .with_issuer(Some("WebDev Studios".to_string()))
        .build()
        .map_err(|e| e.to_string())
}

pub fn totp_verify(secret_b32: &str, email: &str, code: &str) -> bool {
    build_totp(secret_b32, email)
        .ok()
        .and_then(|t| t.check_current(code))
        .is_some()
}

pub fn totp_qr_data_url(secret_b32: &str, email: &str) -> Option<String> {
    build_totp(secret_b32, email)
        .ok()
        .and_then(|t| t.to_qr_base64().ok())
        .map(|b64| format!("data:image/png;base64,{b64}"))
}

#[cfg(test)]
mod tests {
    use super::*;

    // --- Jwt seam ---
    #[test]
    fn jwt_issue_and_verify_access() {
        let jwt = Jwt::new("test-secret-32chars-long-for-hs256-ok", 3600, 604800);
        let token = jwt.issue_access("user-1", "a@b.com", "USER", Some("jti-1".into()));
        let claims = jwt.verify_access(&token).expect("valid");
        assert_eq!(claims.sub, "user-1");
        assert_eq!(claims.email, "a@b.com");
        assert_eq!(claims.role.as_deref(), Some("USER"));
        assert_eq!(claims.jti.as_deref(), Some("jti-1"));
    }

    #[test]
    fn jwt_verify_fails_on_wrong_secret() {
        let jwt1 = Jwt::new("secret-one-32chars-long-for-hs256-ok", 3600, 604800);
        let jwt2 = Jwt::new("secret-two-32chars-long-for-hs256-ok", 3600, 604800);
        let token = jwt1.issue_access("u1", "a@b.com", "USER", None);
        assert!(jwt2.verify_access(&token).is_err());
    }

    #[test]
    fn jwt_refresh_issue_and_verify() {
        let jwt = Jwt::new("test-secret-32chars-long-for-hs256-ok", 3600, 604800);
        let token = jwt.issue_refresh("user-2");
        let claims = jwt.verify_refresh(&token).expect("valid refresh");
        assert_eq!(claims.sub, "user-2");
    }

    #[test]
    fn sign_and_verify_hs256_helpers() {
        #[derive(Debug, serde::Serialize, serde::Deserialize, PartialEq)]
        struct Claims {
            sub: String,
            exp: i64,
        }
        let secret = "helper-secret-32chars-long-for-hs256";
        let c = Claims {
            sub: "abc".into(),
            exp: 9999999999,
        };
        let tok = sign_hs256(secret, &c);
        let got: Option<Claims> = verify_hs256(secret, &tok);
        assert_eq!(got, Some(c));
        let bad: Option<Claims> = verify_hs256("wrong-secret-32chars-long-for-hs256", &tok);
        assert!(bad.is_none());
    }

    // --- password seam ---
    #[test]
    fn hash_and_verify_password() {
        let pw = "CorrectHorseBatteryStaple123!";
        let hash = hash_password(pw).expect("hash");
        assert!(verify_password(&hash, pw));
        assert!(!verify_password(&hash, "wrong"));
        assert!(!verify_password("not-a-hash", pw));
    }

    // --- random_hex seam ---
    #[test]
    fn random_hex_length_and_hex_chars() {
        for n in [0, 1, 16, 32, 64] {
            let s = random_hex(n);
            assert_eq!(s.len(), n * 2);
            assert!(s.chars().all(|c| c.is_ascii_hexdigit()));
        }
        // caps at 64 bytes
        assert_eq!(random_hex(100).len(), 128);
        assert_ne!(random_hex(16), random_hex(16));
    }

    // --- TOTP seam ---
    #[test]
    fn totp_secret_is_base32_and_verifiable() {
        let secret = totp_secret_base32();
        assert!(!secret.is_empty());
        // base32 alphabet check (RFC4648, no pad)
        assert!(secret
            .chars()
            .all(|c| "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567".contains(c)));
        // can build and verify flow: generate code via totp crate directly, then verify via our helper
        let email = "totp@test.com";
        let totp = build_totp(&secret, email).expect("build");
        let code = totp.generate_current().to_string();
        assert!(totp_verify(&secret, email, &code));
        assert!(!totp_verify(&secret, email, "000000"));
        assert!(!totp_verify("JBSWY3DPEHPK3PXP", email, &code)); // wrong secret
    }

    #[test]
    fn totp_qr_is_data_url() {
        let secret = totp_secret_base32();
        let url = totp_qr_data_url(&secret, "qr@test.com").expect("qr");
        assert!(url.starts_with("data:image/png;base64,"));
        assert!(url.len() > 100);
    }

    #[test]
    fn totp_invalid_secret_handled() {
        assert!(!totp_verify("not-base32!!!", "a@b.com", "123456"));
        assert!(totp_qr_data_url("bad", "a@b.com").is_none());
    }
}
