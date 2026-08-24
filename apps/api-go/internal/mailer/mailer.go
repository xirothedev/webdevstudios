package mailer

import (
	"fmt"
	"net/smtp"
	"os"
)

// Service sends via Gmail STARTTLS with an app password (matches the
// NestJS nodemailer `service: 'gmail'` transport). nil = not configured.
type Service struct {
	user     string
	pass     string
	frontend string
}

func New() *Service {
	s := &Service{
		user:     os.Getenv("MAIL_USER"),
		pass:     os.Getenv("MAIL_PASS"),
		frontend: os.Getenv("FRONTEND_URL"),
	}
	if s.user == "" || s.pass == "" {
		return nil
	}
	return s
}

func (m *Service) Enabled() bool { return m != nil }

// FrontendURL returns the configured base URL for building email links.
func (m *Service) FrontendURL() string {
	if m == nil {
		return ""
	}
	return m.frontend
}

func (m *Service) SendVerificationEmail(to, token string) error {
	if m == nil {
		return fmt.Errorf("mailer: MAIL_USER/MAIL_PASS not configured")
	}
	link := m.frontend + "/auth/verify-email?token=" + token
	if m.frontend == "" {
		link = "/auth/verify-email?token=" + token
	}
	body := "From: WebDev Studios <" + m.user + ">\r\n" +
		"To: " + to + "\r\n" +
		"Subject: Verify your email\r\n" +
		"MIME-Version: 1.0\r\n" +
		"Content-Type: text/html; charset=utf-8\r\n\r\n" +
		"<p>Welcome to WebDev Studios!</p>" +
		"<p><a href=\"" + link + "\">Click here to verify your email</a></p>" +
		"<p>This link expires in 24 hours.</p>"
	addr := "smtp.gmail.com:587"
	return smtp.SendMail(addr, smtp.PlainAuth("", m.user, m.pass, "smtp.gmail.com"),
		m.user, []string{to}, []byte(body))
}

// Send is the generic transport used by verification and reset mails alike.
func (m *Service) Send(to, subject, htmlBody string) error {
	if m == nil {
		return fmt.Errorf("mailer: MAIL_USER/MAIL_PASS not configured")
	}
	body := "From: WebDev Studios <" + m.user + ">\r\n" +
		"To: " + to + "\r\n" +
		"Subject: " + subject + "\r\n" +
		"MIME-Version: 1.0\r\n" +
		"Content-Type: text/html; charset=utf-8\r\n\r\n" +
		htmlBody
	return smtp.SendMail("smtp.gmail.com:587", smtp.PlainAuth("", m.user, m.pass, "smtp.gmail.com"),
		m.user, []string{to}, []byte(body))
}
