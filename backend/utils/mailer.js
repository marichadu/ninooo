'use strict';

const nodemailer = require('nodemailer');

const ADMIN_EMAIL = process.env.EMAIL_USER || 'vesta-rec@hotmail.com';

const transporter = nodemailer.createTransport({
  host: 'smtp-mail.outlook.com',
  port: 587,
  secure: false,
  auth: {
    user: ADMIN_EMAIL,
    pass: process.env.EMAIL_PASS || '',
  },
  tls: { ciphers: 'SSLv3' },
});

async function notifyAdmin({ name, email, subject, message, propertyTitle }) {
  await transporter.sendMail({
    from: `"VESTA Website" <${ADMIN_EMAIL}>`,
    to: ADMIN_EMAIL,
    subject: `New inquiry: ${subject || 'Contact form'}`,
    text: [
      `From: ${name} <${email}>`,
      propertyTitle ? `Property: ${propertyTitle}` : '',
      '',
      message,
    ].filter(Boolean).join('\n'),
    html: `
      <p><strong>From:</strong> ${name} &lt;${email}&gt;</p>
      ${propertyTitle ? `<p><strong>Property:</strong> ${propertyTitle}</p>` : ''}
      <p><strong>Subject:</strong> ${subject || '—'}</p>
      <hr/>
      <p>${message.replace(/\n/g, '<br/>')}</p>
    `,
  });
}

async function confirmToSender({ name, email }) {
  await transporter.sendMail({
    from: `"VESTA Real Estate" <${ADMIN_EMAIL}>`,
    to: email,
    subject: 'We received your message — VESTA',
    text: [
      `Hello ${name},`,
      '',
      'Thank you for contacting VESTA Real Estate.',
      'We have received your message and will get back to you within 1 business day.',
      '',
      'Best regards,',
      'VESTA Team',
      'vesta-rec@hotmail.com | +995 514 27 99 77',
    ].join('\n'),
    html: `
      <p>Hello <strong>${name}</strong>,</p>
      <p>Thank you for contacting <strong>VESTA Real Estate</strong>.</p>
      <p>We have received your message and will get back to you within 1 business day.</p>
      <br/>
      <p>Best regards,<br/>
      <strong>VESTA Team</strong><br/>
      vesta-rec@hotmail.com | +995 514 27 99 77</p>
    `,
  });
}

module.exports = { notifyAdmin, confirmToSender };
