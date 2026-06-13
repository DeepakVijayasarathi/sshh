const nodemailer = require('nodemailer');

const escapeHtml = (str) =>
  String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

const sendEmail = async ({ to, subject, html }) => {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
  });
};

const emailTemplates = {
  memberApproval: (name, memberNo) => ({
    subject: 'Membership Approved - Sourashtra Community Portal',
    html: `<h2>Welcome, ${escapeHtml(name)}!</h2>
      <p>Your membership has been approved. Your membership number is <strong>${escapeHtml(memberNo)}</strong>.</p>
      <p>You can now login and access all member benefits.</p>`,
  }),
  memberRejection: (name, reason) => ({
    subject: 'Membership Application Update',
    html: `<h2>Dear ${escapeHtml(name)},</h2>
      <p>We regret to inform you that your membership application could not be approved at this time.</p>
      <p>Reason: ${escapeHtml(reason)}</p>`,
  }),
  eventRegistration: (name, eventTitle, date) => ({
    subject: `Event Registration Confirmed - ${escapeHtml(eventTitle)}`,
    html: `<h2>Dear ${escapeHtml(name)},</h2>
      <p>Your registration for <strong>${escapeHtml(eventTitle)}</strong> on <strong>${escapeHtml(String(date))}</strong> has been confirmed.</p>`,
  }),
  scholarshipUpdate: (name, status) => ({
    subject: 'Scholarship Application Update',
    html: `<h2>Dear ${escapeHtml(name)},</h2>
      <p>Your scholarship application status has been updated to: <strong>${escapeHtml(status)}</strong>.</p>`,
  }),
  emailVerification: (name, verifyUrl) => ({
    subject: 'Verify Your Email - Sourashtra Community Portal',
    html: `<h2>Welcome, ${escapeHtml(name)}!</h2>
      <p>Thank you for registering. Please verify your email address by clicking the button below.</p>
      <a href="${verifyUrl}" style="background:#8B0000;color:white;padding:10px 20px;text-decoration:none;border-radius:4px;display:inline-block;margin:12px 0;">Verify Email</a>
      <p>This link expires in 24 hours. If you did not create an account, you can safely ignore this email.</p>`,
  }),
};

module.exports = { sendEmail, emailTemplates };
