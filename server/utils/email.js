const nodemailer = require('nodemailer');

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
    html: `<h2>Welcome, ${name}!</h2>
      <p>Your membership has been approved. Your membership number is <strong>${memberNo}</strong>.</p>
      <p>You can now login and access all member benefits.</p>`,
  }),
  memberRejection: (name, reason) => ({
    subject: 'Membership Application Update',
    html: `<h2>Dear ${name},</h2>
      <p>We regret to inform you that your membership application could not be approved at this time.</p>
      <p>Reason: ${reason}</p>`,
  }),
  eventRegistration: (name, eventTitle, date) => ({
    subject: `Event Registration Confirmed - ${eventTitle}`,
    html: `<h2>Dear ${name},</h2>
      <p>Your registration for <strong>${eventTitle}</strong> on <strong>${date}</strong> has been confirmed.</p>`,
  }),
  scholarshipUpdate: (name, status) => ({
    subject: 'Scholarship Application Update',
    html: `<h2>Dear ${name},</h2>
      <p>Your scholarship application status has been updated to: <strong>${status}</strong>.</p>`,
  }),
};

module.exports = { sendEmail, emailTemplates };
