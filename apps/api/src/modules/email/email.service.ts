import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(EmailService.name);

  constructor(private configService: ConfigService) {
    const host = this.configService.get<string>('SMTP_HOST');
    const port = this.configService.get<number>('SMTP_PORT', 587);
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASS');

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
    });
  }

  async sendMail(to: string, subject: string, html: string, text?: string) {
    const from = this.configService.get<string>('SMTP_FROM', '"KOEN" <noreply@koen.app>');

    try {
      await this.transporter.sendMail({
        from,
        to,
        subject,
        text,
        html,
      });
      this.logger.log(`Email sent to ${to}: ${subject}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}`, error);
      // In development, we don't want to crash if SMTP is not configured
      if (process.env.NODE_ENV === 'production') {
        throw error;
      }
    }
  }

  async sendAccountInvitation(email: string, token: string, invitedByName: string) {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000');
    const inviteLink = `${frontendUrl}/signup?token=${token}`;

    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h2 style="color: #eab308;">Join KOEN Site Assistant</h2>
        <p>Hi there!</p>
        <p><strong>${invitedByName}</strong> has invited you to join the KOEN team as a worker.</p>
        <p>KOEN helps you capture construction site updates using just your voice.</p>
        <div style="margin: 30px 0;">
          <a href="${inviteLink}" style="background-color: #eab308; color: black; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
            Set up your account
          </a>
        </div>
        <p style="font-size: 12px; color: #666;">If the button doesn't work, copy and paste this link: <br/> ${inviteLink}</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 10px; color: #999;">KOEN — Professional Site Intelligence</p>
      </div>
    `;

    await this.sendMail(email, 'You are invited to join KOEN', html);
  }

  async sendProjectAssignment(email: string, projectName: string) {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000');
    
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h2 style="color: #eab308;">New Site Assignment</h2>
        <p>You have been added to a new project: <strong>${projectName}</strong>.</p>
        <p>You can now start capturing voice notes and viewing records for this site.</p>
        <div style="margin: 30px 0;">
          <a href="${frontendUrl}/projects" style="background-color: #eab308; color: black; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
            View Site
          </a>
        </div>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 10px; color: #999;">KOEN — Professional Site Intelligence</p>
      </div>
    `;

    await this.sendMail(email, `New Site Assignment: ${projectName}`, html);
  }
}
