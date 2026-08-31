// ponytail: payos scaffolding for upcoming payment routes — allow until wired
#![allow(dead_code)]
use hmac::{Hmac, Mac};
use serde_json::{Map, Value};
use sha2::Sha256;

pub struct PayosClient {
    client_id: String,
    api_key: String,
    pub checksum_key: String,
    pub return_url: String,
    pub cancel_url: String,
    http: reqwest::Client,
}

#[derive(Debug, serde::Serialize)]
pub struct PaymentItem {
    pub name: String,
    pub quantity: i64,
    pub price: f64,
}

#[derive(Debug)]
pub struct CreatedLink {
    pub checkout_url: String,
    pub payment_link_id: String,
}

impl PayosClient {
    pub fn new(
        client_id: &str,
        api_key: &str,
        checksum_key: &str,
        return_url: &str,
        cancel_url: &str,
    ) -> Self {
        Self {
            client_id: client_id.into(),
            api_key: api_key.into(),
            checksum_key: checksum_key.into(),
            return_url: return_url.into(),
            cancel_url: cancel_url.into(),
            http: reqwest::Client::new(),
        }
    }

    pub async fn create_payment_link(
        &self,
        order_code_num: i64,
        amount: f64,
        description: &str,
        items: &[PaymentItem],
    ) -> Result<CreatedLink, String> {
        let payload = serde_json::json!({
            "orderCode": order_code_num,
            "amount": amount,
            "description": description,
            "returnUrl": self.return_url,
            "cancelUrl": self.cancel_url,
            "items": items,
        });
        let resp = self
            .http
            .post("https://api-merchant.payos.vn/v2/payment-requests")
            .header("Content-Type", "application/json")
            .header("x-client-id", &self.client_id)
            .header("x-api-key", &self.api_key)
            .json(&payload)
            .send()
            .await
            .map_err(|e| format!("payos request failed: {e}"))?;
        let body: Value = resp
            .json()
            .await
            .map_err(|e| format!("payos response failed: {e}"))?;
        let code = body.get("code").and_then(|v| v.as_str()).unwrap_or("");
        if code != "00" {
            let desc = body.get("desc").and_then(|v| v.as_str()).unwrap_or("");
            return Err(format!("payos: {code} {desc}"));
        }
        let data = body.get("data").cloned().unwrap_or(Value::Null);
        let checkout_url = data
            .get("checkoutUrl")
            .and_then(|v| v.as_str())
            .unwrap_or_default()
            .to_string();
        let mut link_id = data
            .get("paymentLinkId")
            .and_then(|v| v.as_str())
            .unwrap_or_default()
            .to_string();
        if link_id.is_empty() {
            link_id = data
                .get("orderCode")
                .and_then(|v| v.as_i64())
                .map(|n| n.to_string())
                .unwrap_or_default();
        }
        Ok(CreatedLink {
            checkout_url,
            payment_link_id: link_id,
        })
    }

    /// PayOS webhook signature: sort `data` keys alphabetically, join key=value
    /// with '&', HMAC-SHA256 with the checksum key, hex-compare with envelope
    /// signature. Mirrors the @payos/node SDK and the api-go implementation.
    pub fn verify_webhook_signature(&self, envelope: &Value) -> bool {
        let sig = envelope.get("signature").and_then(|v| v.as_str()).unwrap_or("");
        let data = match envelope.get("data") {
            Some(Value::Object(m)) => m,
            _ => return false,
        };
        let canonical = canonical_string(data);
        let mut mac: Hmac<Sha256> =
            Mac::new_from_slice(self.checksum_key.as_bytes()).expect("hmac accepts any size");
        mac.update(canonical.as_bytes());
        let expected = hex::encode(mac.finalize().into_bytes());
        constant_time_eq(expected.as_bytes(), sig.as_bytes())
    }
}

// ponytail: serde_json::Map may be insertion-ordered (preserve_order); sort explicitly so
// webhook signature verification is independent of key order.
fn canonical_string(data: &Map<String, Value>) -> String {
    let mut keys: Vec<String> = data.keys().cloned().collect();
    keys.sort();
    keys.iter()
        .filter_map(|k| data.get(k).map(|v| format!("{k}={}", json_value_string(v))))
        .collect::<Vec<_>>()
        .join("&")
}

fn json_value_string(v: &Value) -> String {
    match v {
        Value::String(s) => s.clone(),
        Value::Number(n) => {
            if let Some(i) = n.as_i64() {
                i.to_string()
            } else if let Some(f) = n.as_f64() {
                format!("{f}")
            } else {
                v.to_string()
            }
        }
        Value::Bool(b) => b.to_string(),
        Value::Null => "null".to_string(),
        other => other.to_string(),
    }
}

fn constant_time_eq(a: &[u8], b: &[u8]) -> bool {
    if a.len() != b.len() {
        return false;
    }
    a.iter()
        .zip(b.iter())
        .fold(0u8, |acc, (x, y)| acc | (x ^ y))
        == 0
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[test]
    fn verify_webhook_test_vector() {
        let c = PayosClient::new("id", "key", "testsecret", "", "");
        let raw = r#"{"code":"00","desc":"success","success":true,"data":{"accountNumber":"1","amount":130000,"code":"00","currency":"VND","description":"pay","desc":"ok","orderCode":29974,"paymentLinkId":"TESTLINK123","reference":"r1","transactionDateTime":"2026-08-24T00:00:00+07:00"},"signature":"e19b5c66d0cfe86a542ecfb0db96cb238d301b914bcaef78bd90d54d0d03fd07"}"#;
        let envelope: Value = serde_json::from_str(raw).unwrap();
        assert!(c.verify_webhook_signature(&envelope));
    }

    #[test]
    fn reject_tampered_signature() {
        let c = PayosClient::new("id", "key", "testsecret", "", "");
        let raw = r#"{"code":"00","desc":"success","success":true,"data":{"amount":130000,"orderCode":29974},"signature":"deadbeef"}"#;
        let envelope: Value = serde_json::from_str(raw).unwrap();
        assert!(!c.verify_webhook_signature(&envelope));
    }

    #[test]
    fn reject_wrong_key() {
        let c = PayosClient::new("id", "key", "wrongkey", "", "");
        let raw = r#"{"code":"00","desc":"success","success":true,"data":{"accountNumber":"1","amount":130000,"code":"00","currency":"VND","description":"pay","desc":"ok","orderCode":29974,"paymentLinkId":"TESTLINK123","reference":"r1","transactionDateTime":"2026-08-24T00:00:00+07:00"},"signature":"e19b5c66d0cfe86a542ecfb0db96cb238d301b914bcaef78bd90d54d0d03fd07"}"#;
        let envelope: Value = serde_json::from_str(raw).unwrap();
        assert!(!c.verify_webhook_signature(&envelope));
    }

    #[test]
    fn canonical_string_sorted() {
        let v: Value = json!({"b": 2, "a": "x", "c": true});
        let data = v.as_object().unwrap();
        assert_eq!(canonical_string(data), "a=x&b=2&c=true");
    }
}
