// ponytail: mailer scaffolding for upcoming auth routes — allow until wired
#![allow(dead_code)]
use lettre::address::Address;
use lettre::message::{Mailbox, MessageBuilder, SinglePart};
use lettre::transport::smtp::authentication::Credentials;
use lettre::AsyncTransport;
use lettre::{AsyncSmtpTransport, Tokio1Executor};

use crate::config::Config;

const VERIFICATION_TEMPLATE: &str = include_str!("../templates/verification-email.html");
const PASSWORD_RESET_TEMPLATE: &str = include_str!("../templates/password-reset.html");

type SmtpTransport = AsyncSmtpTransport<Tokio1Executor>;

#[derive(Clone)]
pub struct Mailer {
    transport: Option<SmtpTransport>,
    from: String,
    frontend_url: String,
}

impl Mailer {
    pub fn new(cfg: &Config) -> Self {
        let transport = match (&cfg.mail_user, &cfg.mail_pass) {
            (Some(user), Some(password)) => {
                AsyncSmtpTransport::<Tokio1Executor>::starttls_relay("smtp.gmail.com:587")
                    .ok()
                    .map(|builder| {
                        builder
                            .credentials(Credentials::new(user.clone(), password.clone()))
                            .port(587)
                            .build::<Tokio1Executor>()
                    })
            }
            _ => None,
        };
        Self {
            transport,
            from: cfg.mail_user.clone().unwrap_or_else(|| "webdevstudio@gmail.com".to_string()),
            frontend_url: cfg.frontend_url.clone(),
        }
    }

    pub fn enabled(&self) -> bool {
        self.transport.is_some()
    }

    pub async fn send_verification_email(&self, to: &str, token: &str) -> Result<(), String> {
        let url = format!("{}/verify?token={}", self.frontend_url, token);
        let html = fill(
            VERIFICATION_TEMPLATE,
            &[("verificationUrl", &url), ("currentYear", &year())],
        );
        self.send(to, "Webdev Studio - Verify your email", &html).await
    }

    pub async fn send_password_reset_email(&self, to: &str, token: &str) -> Result<(), String> {
        let url = format!("{}/auth/reset-password?token={}", self.frontend_url, token);
        let html = fill(
            PASSWORD_RESET_TEMPLATE,
            &[("resetUrl", &url), ("currentYear", &year())],
        );
        self.send(to, "Webdev Studio - Reset Your Password", &html).await
    }

    async fn send(&self, to: &str, subject: &str, html: &str) -> Result<(), String> {
        let Some(transport) = &self.transport else {
            tracing::info!(to, subject, "mailer not configured; skipping send");
            return Ok(());
        };
        let to_addr = parse_address(to)?;
        let from_addr = parse_address(&self.from)?;
        let message = MessageBuilder::new()
            .from(Mailbox::new(Some("WebDev Studios".to_string()), from_addr))
            .to(Mailbox::new(None, to_addr))
            .subject(subject)
            .singlepart(SinglePart::html(html.to_string()))
            .map_err(|e| e.to_string())?;
        transport
            .send(message)
            .await
            .map(|_| ())
            .map_err(|e| e.to_string())
    }
}

fn parse_address(email: &str) -> Result<Address, String> {
    let (user, domain) = email
        .rsplit_once('@')
        .ok_or_else(|| format!("invalid email: {email}"))?;
    Address::new(user, domain).map_err(|e| e.to_string())
}

fn fill(template: &str, vars: &[(&str, &str)]) -> String {
    let mut out = template.to_string();
    for (key, value) in vars {
        out = out.replace(&format!("{{{{{key}}}}}"), value);
    }
    out
}

fn year() -> String {
    chrono::Utc::now().format("%Y").to_string()
}
