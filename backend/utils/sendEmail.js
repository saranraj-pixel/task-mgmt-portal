const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, link) => {
  const transporter = nodemailer.createTransport({
    service: "gmail", // or SES, SendGrid, etc
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"Opero Employee Task Management Portal" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html: `
      <h2>You are invited</h2>
      <p>Click below to join:</p>
      <a href="${link}">${link}</a>
      <p>This link expires in 24 hours.</p>
    `,
  });
};

module.exports = sendEmail;
