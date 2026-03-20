import nodemailer from "nodemailer";

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
}

const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;

if (!emailUser || !emailPass) {
  console.warn("[mailer] EMAIL_USER and EMAIL_PASS are required for SMTP email sending.");
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: emailUser,
    pass: emailPass,
  },
});

export async function sendEmail({ to, subject, html, text, from }: SendEmailOptions) {
  if (!emailUser || !emailPass) {
    throw new Error("Email credentials are not configured (EMAIL_USER, EMAIL_PASS required).");
  }

  const fromAddress = from || `DentWise <${emailUser}>`;
  const toList = Array.isArray(to) ? to.join(", ") : to;

  const message = {
    from: fromAddress,
    to: toList,
    subject,
    html,
    text,
  };

  const result = await transporter.sendMail(message);
  return result;
}
