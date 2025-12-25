import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';
import { readFileSync } from 'fs';
import { join } from 'path';

@Injectable()
export class MailService {
  readonly templatePath: string;

  constructor(
    private readonly mailer: MailerService,
    private readonly config: ConfigService
  ) {
    this.templatePath = join(__dirname, 'templates', 'verification-email.html');
  }

  private loadTemplate(
    templateName: string = 'verification-email.html'
  ): string {
    const templatePath = join(__dirname, 'templates', templateName);
    try {
      return readFileSync(templatePath, 'utf-8');
    } catch (error) {
      throw new Error(
        `Failed to load email template: ${templatePath}. Error: ${error}`
      );
    }
  }

  private replaceTemplateVariables(
    template: string,
    variables: Record<string, string>
  ): string {
    let html = template;
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      html = html.replace(regex, value);
    }
    return html;
  }

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    const frontendUrl =
      this.config.get<string>('FRONTEND_URL') ||
      `http://localhost:${this.config.getOrThrow<string>('PORT', '3000')}`;
    const verificationUrl = `${frontendUrl}/verify?token=${encodeURIComponent(token)}`;
    const currentYear = new Date().getFullYear().toString();

    // Load HTML template
    const template = this.loadTemplate('verification-email.html');

    // Replace template variables
    const html = this.replaceTemplateVariables(template, {
      verificationUrl,
      currentYear,
    });

    // Create plain text version
    const text = `Welcome to Webdev Studio!

Thank you for registering with us. To complete your registration and activate your account, please verify your email address by clicking the link below:

${verificationUrl}

Note: This verification link will expire in 24 hours. If you didn't create an account, please ignore this email.

---
This email was sent by Webdev Studio
© ${currentYear} Webdev Studio. All rights reserved.`;

    await this.mailer.sendMail({
      to: email,
      subject: 'Webdev Studio - Verify your email',
      text,
      html,
    });
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const frontendUrl =
      this.config.get<string>('FRONTEND_URL') ||
      `http://localhost:${this.config.get<string>('PORT', '3000')}`;
    const resetUrl = `${frontendUrl}/auth/reset-password?token=${encodeURIComponent(token)}`;
    const currentYear = new Date().getFullYear().toString();

    // Load HTML template
    const template = this.loadTemplate('password-reset.html');

    // Replace template variables
    const html = this.replaceTemplateVariables(template, {
      resetUrl,
      currentYear,
    });

    // Create plain text version
    const text = `Password Reset Request

We received a request to reset your password. If you didn't make this request, you can safely ignore this email.

To reset your password, please click the link below:

${resetUrl}

Security Notice: This link will expire in 1 hour. For your security, please do not share this link with anyone. If you didn't request a password reset, please contact our support team immediately.

---
This email was sent by Webdev Studio
© ${currentYear} Webdev Studio. All rights reserved.`;

    await this.mailer.sendMail({
      to: email,
      subject: 'Webdev Studio - Reset Your Password',
      text,
      html,
    });
  }
}
