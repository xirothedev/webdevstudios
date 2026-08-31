// ponytail: storage scaffolding for upcoming upload routes — allow until wired
#![allow(dead_code)]
use aws_credential_types::Credentials;
use aws_credential_types::provider::SharedCredentialsProvider;
use aws_sdk_s3::primitives::ByteStream;
use aws_sdk_s3::Client;
use aws_types::region::Region;

pub struct StorageClient {
    s3: Client,
    pub bucket: String,
    pub public_url: String,
}

impl StorageClient {
    pub async fn new(
        endpoint: &str,
        access_key_id: &str,
        secret_access_key: &str,
        bucket: &str,
        public_url: &str,
    ) -> Self {
        let provider = SharedCredentialsProvider::new(Credentials::new(
            access_key_id,
            secret_access_key,
            None,
            None,
            "static",
        ));
        let mut loader = aws_config::defaults(aws_config::BehaviorVersion::latest())
            .region(Region::new("auto"))
            .credentials_provider(provider);
        if !endpoint.is_empty() {
            loader = loader.endpoint_url(endpoint);
        }
        let conf = loader.load().await;
        let s3 = Client::new(&conf);
        Self {
            s3,
            bucket: bucket.into(),
            public_url: public_url.trim_end_matches('/').to_string(),
        }
    }

    pub async fn upload_file(
        &self,
        key: &str,
        bytes: &[u8],
        content_type: &str,
        cache_control: &str,
        metadata: &[(String, String)],
    ) -> Result<(), String> {
        let mut cmd = self.s3
            .put_object()
            .bucket(&self.bucket)
            .key(key)
            .content_type(content_type)
            .cache_control(cache_control)
            .body(ByteStream::from(bytes.to_vec()));
        for (k, v) in metadata {
            cmd = cmd.metadata(k, v);
        }
        cmd.send()
            .await
            .map_err(|e| format!("Failed to upload file: {e}"))?;
        Ok(())
    }

    pub async fn delete_file(&self, key: &str) -> Result<(), String> {
        self.s3
            .delete_object()
            .bucket(&self.bucket)
            .key(key)
            .send()
            .await
            .map_err(|e| format!("Failed to delete file: {e}"))?;
        Ok(())
    }

    pub async fn get_text(&self, key: &str) -> Result<String, String> {
        let out = self
            .s3
            .get_object()
            .bucket(&self.bucket)
            .key(key)
            .send()
            .await
            .map_err(|e| format!("Failed to get blog content: {e}"))?;
        let bytes = out
            .body
            .collect()
            .await
            .map_err(|e| format!("Failed to read blog content: {e}"))?
            .to_vec();
        String::from_utf8(bytes).map_err(|e| format!("Invalid content encoding: {e}"))
    }

    pub fn file_url(&self, key: &str) -> String {
        format!("{}/{}", self.public_url, key)
    }

    /// Rows persist R2 keys; absolute URLs (OAuth provider pictures) pass through.
    pub fn resolve_media_url(&self, ref_: Option<&str>) -> Option<String> {
        let ref_ = ref_?;
        if ref_.is_empty() {
            return None;
        }
        if ref_.contains("://") {
            Some(ref_.to_string())
        } else {
            Some(self.file_url(ref_))
        }
    }

    pub fn cache_control(strategy: Option<&str>, max_age: Option<i64>) -> String {
        let strategy = strategy.unwrap_or("long-lived");
        if strategy == "no-cache" {
            return "no-cache, no-store, must-revalidate".to_string();
        }
        let default = match strategy {
            "immutable" => 31_536_000,
            "short-lived" => 86_400,
            _ => 2_592_000,
        };
        let age = max_age.unwrap_or(default);
        if strategy == "immutable" {
            format!("public, max-age={age}, immutable")
        } else {
            format!("public, max-age={age}")
        }
    }

    pub async fn upload_blog_content(&self, post_id: &str, content: &str) -> Result<String, String> {
        let key = format!("blog/posts/{post_id}/content.md");
        self.upload_file(
            &key,
            content.as_bytes(),
            "text/markdown",
            &Self::cache_control(Some("long-lived"), None),
            &[],
        )
        .await?;
        Ok(key)
    }

    pub async fn upload_blog_cover_image(
        &self,
        post_id: &str,
        file: &[u8],
        content_type: &str,
    ) -> Result<String, String> {
        let key = format!("blog/images/covers/{post_id}-cover.webp");
        self.upload_file(
            &key,
            file,
            content_type,
            &Self::cache_control(Some("immutable"), None),
            &[],
        )
        .await?;
        Ok(key)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn client() -> StorageClient {
        StorageClient {
            s3: {
                use aws_types::region::Region;
                let conf = aws_types::sdk_config::SdkConfig::builder()
                    .region(Region::new("auto"))
                    .behavior_version(aws_config::BehaviorVersion::latest())
                    .build();
                Client::from_conf((&conf).into())
            },
            bucket: "my-bucket".to_string(),
            public_url: "https://cdn.example.com".to_string(),
        }
    }

    #[test]
    fn file_url_joins_public_url_and_key() {
        let c = client();
        assert_eq!(c.file_url("a/b/c.webp"), "https://cdn.example.com/a/b/c.webp");
        assert_eq!(c.file_url("key"), "https://cdn.example.com/key");
    }

    #[test]
    fn resolve_media_url_passthrough_and_resolve() {
        let c = client();
        assert_eq!(c.resolve_media_url(None), None);
        assert_eq!(c.resolve_media_url(Some("")), None);
        assert_eq!(
            c.resolve_media_url(Some("https://lh3.googleusercontent.com/a/avatar.jpg")),
            Some("https://lh3.googleusercontent.com/a/avatar.jpg".to_string())
        );
        assert_eq!(
            c.resolve_media_url(Some("blog/images/covers/x.webp")),
            Some("https://cdn.example.com/blog/images/covers/x.webp".to_string())
        );
        assert_eq!(
            c.resolve_media_url(Some("http://example.com/img.jpg")),
            Some("http://example.com/img.jpg".to_string())
        );
    }

    #[test]
    fn cache_control_strategies() {
        assert_eq!(StorageClient::cache_control(None, None), "public, max-age=2592000");
        assert_eq!(
            StorageClient::cache_control(Some("immutable"), None),
            "public, max-age=31536000, immutable"
        );
        assert_eq!(
            StorageClient::cache_control(Some("long-lived"), None),
            "public, max-age=2592000"
        );
        assert_eq!(
            StorageClient::cache_control(Some("short-lived"), None),
            "public, max-age=86400"
        );
        assert_eq!(
            StorageClient::cache_control(Some("no-cache"), None),
            "no-cache, no-store, must-revalidate"
        );
        assert_eq!(StorageClient::cache_control(Some("long-lived"), Some(123)), "public, max-age=123");
        assert_eq!(
            StorageClient::cache_control(Some("immutable"), Some(60)),
            "public, max-age=60, immutable"
        );
        // unknown strategy falls back to long-lived
        assert_eq!(StorageClient::cache_control(Some("unknown"), None), "public, max-age=2592000");
    }
}
