import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: parseInt(process.env.MAIL_PORT ?? '587'),
      secure: false, // TLS
      auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
      },
    });
  }

  private async send(to: string, subject: string, html: string) {
    await this.transporter.sendMail({
      from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
      to,
      subject,
      html,
    });
  }

  // ─────────────────────────────────────────
  // COMPANY emails
  // ─────────────────────────────────────────

  async sendCompanyApproved(to: string, companyName: string) {
    await this.send(
      to,
      '✅ Your Company Has Been Approved — CareerHub',
      `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#f9f9f9;border-radius:8px">
        <h2 style="color:#16a34a">🎉 Company Approved!</h2>
        <p>Hello,</p>
        <p>Great news! Your company <strong>${companyName}</strong> has been <strong style="color:#16a34a">approved</strong> on CareerHub.</p>
        <p>You can now log in and start posting jobs.</p>
        <a href="${process.env.FRONTEND_URL ?? 'http://localhost:5173'}/company/dashboard"
          style="display:inline-block;margin-top:16px;padding:12px 24px;background:#16a34a;color:#fff;border-radius:6px;text-decoration:none;font-weight:bold">
          Go to Dashboard
        </a>
        <p style="margin-top:24px;color:#888;font-size:12px">CareerHub Team</p>
      </div>
      `,
    );
  }

  async sendCompanyRejected(to: string, companyName: string, reason: string) {
    await this.send(
      to,
      '❌ Company Registration Update — CareerHub',
      `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#f9f9f9;border-radius:8px">
        <h2 style="color:#dc2626">Company Not Approved</h2>
        <p>Hello,</p>
        <p>Unfortunately, your company <strong>${companyName}</strong> was <strong style="color:#dc2626">rejected</strong>.</p>
        <div style="background:#fee2e2;border-left:4px solid #dc2626;padding:12px 16px;border-radius:4px;margin:16px 0">
          <strong>Reason:</strong> ${reason}
        </div>
        <p>If you believe this is a mistake, please contact our support team.</p>
        <p style="margin-top:24px;color:#888;font-size:12px">CareerHub Team</p>
      </div>
      `,
    );
  }

  async sendCompanySuspended(to: string, companyName: string, reason?: string) {
    await this.send(
      to,
      '⚠️ Company Suspended — CareerHub',
      `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#f9f9f9;border-radius:8px">
        <h2 style="color:#d97706">Company Suspended</h2>
        <p>Hello,</p>
        <p>Your company <strong>${companyName}</strong> has been <strong style="color:#d97706">suspended</strong> on CareerHub.</p>
        ${reason ? `<div style="background:#fef3c7;border-left:4px solid #d97706;padding:12px 16px;border-radius:4px;margin:16px 0"><strong>Reason:</strong> ${reason}</div>` : ''}
        <p>Please contact support if you have any questions.</p>
        <p style="margin-top:24px;color:#888;font-size:12px">CareerHub Team</p>
      </div>
      `,
    );
  }

  // ─────────────────────────────────────────
  // JOB emails
  // ─────────────────────────────────────────

  async sendJobApproved(to: string, jobTitle: string) {
    await this.send(
      to,
      '✅ Your Job Posting Is Live — CareerHub',
      `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#f9f9f9;border-radius:8px">
        <h2 style="color:#16a34a">🎉 Job Approved!</h2>
        <p>Hello,</p>
        <p>Your job posting <strong>${jobTitle}</strong> has been <strong style="color:#16a34a">approved</strong> and is now live on CareerHub.</p>
        <a href="${process.env.FRONTEND_URL ?? 'http://localhost:5173'}/company/jobs"
          style="display:inline-block;margin-top:16px;padding:12px 24px;background:#16a34a;color:#fff;border-radius:6px;text-decoration:none;font-weight:bold">
          View Job
        </a>
        <p style="margin-top:24px;color:#888;font-size:12px">CareerHub Team</p>
      </div>
      `,
    );
  }

  async sendJobRejected(to: string, jobTitle: string, reason: string) {
    await this.send(
      to,
      '❌ Job Posting Update — CareerHub',
      `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#f9f9f9;border-radius:8px">
        <h2 style="color:#dc2626">Job Not Approved</h2>
        <p>Hello,</p>
        <p>Your job posting <strong>${jobTitle}</strong> was <strong style="color:#dc2626">rejected</strong>.</p>
        <div style="background:#fee2e2;border-left:4px solid #dc2626;padding:12px 16px;border-radius:4px;margin:16px 0">
          <strong>Reason:</strong> ${reason}
        </div>
        <p>Please update your job posting and resubmit.</p>
        <p style="margin-top:24px;color:#888;font-size:12px">CareerHub Team</p>
      </div>
      `,
    );
  }

  // ─────────────────────────────────────────
  // INSTITUTION emails (sent to USER)
  // ─────────────────────────────────────────

  async sendInstitutionApproved(to: string, institutionName: string) {
    await this.send(
      to,
      '✅ Your Institution Has Been Approved — CareerHub',
      `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#f9f9f9;border-radius:8px">
        <h2 style="color:#16a34a">🎉 Institution Approved!</h2>
        <p>Hello,</p>
        <p>Your institution <strong>${institutionName}</strong> has been <strong style="color:#16a34a">approved</strong> on CareerHub.</p>
        <p>You can now log in and start adding courses.</p>
        <a href="${process.env.FRONTEND_URL ?? 'http://localhost:5173'}/user/institutions"
          style="display:inline-block;margin-top:16px;padding:12px 24px;background:#16a34a;color:#fff;border-radius:6px;text-decoration:none;font-weight:bold">
          Manage Institution
        </a>
        <p style="margin-top:24px;color:#888;font-size:12px">CareerHub Team</p>
      </div>
      `,
    );
  }

  async sendInstitutionRejected(to: string, institutionName: string, reason: string) {
    await this.send(
      to,
      '❌ Institution Submission Update — CareerHub',
      `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#f9f9f9;border-radius:8px">
        <h2 style="color:#dc2626">Institution Not Approved</h2>
        <p>Hello,</p>
        <p>Your institution <strong>${institutionName}</strong> was <strong style="color:#dc2626">rejected</strong>.</p>
        <div style="background:#fee2e2;border-left:4px solid #dc2626;padding:12px 16px;border-radius:4px;margin:16px 0">
          <strong>Reason:</strong> ${reason}
        </div>
        <p>Please review the feedback and resubmit.</p>
        <p style="margin-top:24px;color:#888;font-size:12px">CareerHub Team</p>
      </div>
      `,
    );
  }

  // ─────────────────────────────────────────
  // APPLICATION email (sent to USER)
  // ─────────────────────────────────────────

  async sendApplicationShortlisted(to: string, jobTitle: string, companyName: string) {
    await this.send(
      to,
      '🎉 You Have Been Shortlisted — CareerHub',
      `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#f9f9f9;border-radius:8px">
        <h2 style="color:#2563eb">You've Been Shortlisted!</h2>
        <p>Hello,</p>
        <p>Congratulations! You have been <strong style="color:#2563eb">shortlisted</strong> for the position of <strong>${jobTitle}</strong> at <strong>${companyName}</strong>.</p>
        <p>The company will be in touch with you shortly about next steps.</p>
        <a href="${process.env.FRONTEND_URL ?? 'http://localhost:5173'}/user/applications"
          style="display:inline-block;margin-top:16px;padding:12px 24px;background:#2563eb;color:#fff;border-radius:6px;text-decoration:none;font-weight:bold">
          View Application
        </a>
        <p style="margin-top:24px;color:#888;font-size:12px">CareerHub Team</p>
      </div>
      `,
    );
  }

  async sendInterviewScheduled(
    to: string,
    jobTitle: string,
    companyName: string,
    interviewDate?: Date | null,
    interviewType?: string | null,
    notes?: string | null,
    meetingLink?: string | null,
  ) {
    const interviewDateText = interviewDate
      ? interviewDate.toLocaleString()
      : null;

    await this.send(
      to,
      'Interview Scheduled - CareerHub',
      `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#f9f9f9;border-radius:8px">
        <h2 style="color:#2563eb">Interview Scheduled</h2>
        <p>Hello,</p>
        <p>Your interview has been scheduled for <strong>${jobTitle}</strong> at <strong>${companyName}</strong>.</p>
        <div style="background:#dbeafe;border-left:4px solid #2563eb;padding:12px 16px;border-radius:4px;margin:16px 0">
          ${interviewDateText ? `<p style="margin:0 0 8px 0"><strong>Date & Time:</strong> ${interviewDateText}</p>` : ''}
          ${interviewType ? `<p style="margin:0 0 8px 0"><strong>Type:</strong> ${interviewType}</p>` : ''}
          ${notes ? `<p style="margin:0 0 8px 0"><strong>Notes:</strong> ${notes}</p>` : ''}
          ${meetingLink ? `<p style="margin:0"><strong>Meeting Link:</strong> <a href="${meetingLink}">${meetingLink}</a></p>` : ''}
        </div>
        <a href="${process.env.FRONTEND_URL ?? 'http://localhost:5173'}/user/interviews"
          style="display:inline-block;margin-top:16px;padding:12px 24px;background:#2563eb;color:#fff;border-radius:6px;text-decoration:none;font-weight:bold">
          View Interview
        </a>
        <p style="margin-top:24px;color:#888;font-size:12px">CareerHub Team</p>
      </div>
      `,
    );
  }
}
