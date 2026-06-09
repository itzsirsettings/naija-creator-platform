const axios = require('axios');
const nodemailer = require('nodemailer');
const env = require('../config/env');
const logger = require('../lib/logger');

let transporter = null;

const hasSmtpConfig = () => Boolean(env.smtpHost && env.smtpUser && env.smtpPass && env.emailFrom);
const hasResendConfig = () => Boolean(env.resendApiKey && env.emailFrom);
const isConfigured = () => hasResendConfig() || hasSmtpConfig();

const getTransporter = () => {
  if (!hasSmtpConfig()) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.smtpHost,
      port: env.smtpPort,
      secure: env.smtpPort === 465,
      auth: {
        user: env.smtpUser,
        pass: env.smtpPass,
      },
    });
  }
  return transporter;
};

const sendWithResend = async ({ to, subject, text }) => {
  try {
    const { data } = await axios.post(
      'https://api.resend.com/emails',
      {
        from: env.emailFrom,
        to: [to],
        subject,
        text,
      },
      {
        headers: {
          Authorization: `Bearer ${env.resendApiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: env.requestTimeoutMs,
      },
    );
    return data;
  } catch (error) {
    logger.error(
      {
        err: error?.response?.data || error.message,
        to,
        subject,
      },
      'resend email failed',
    );
    const err = new Error('Email provider could not send the message');
    err.statusCode = 502;
    throw err;
  }
};

const sendMail = async ({ to, subject, text }) => {
  if (env.resendApiKey) {
    return sendWithResend({ to, subject, text });
  }

  const mailer = getTransporter();
  if (!mailer) {
    if (env.isProduction) {
      const err = new Error('Email transport is not configured');
      err.statusCode = 503;
      throw err;
    }
    logger.info({ to, subject, text }, 'email preview');
    return { preview: true };
  }

  return mailer.sendMail({
    from: env.emailFrom,
    to,
    subject,
    text,
  });
};

const sendPasswordResetEmail = (user, token) => {
  const url = `${env.frontendUrl}/reset-password?token=${encodeURIComponent(token)}`;
  return sendMail({
    to: user.email,
    subject: 'Reset your Tehilla password',
    text: `Reset your Tehilla password here: ${url}\n\nThis link expires in 30 minutes.`,
  });
};

const sendVerificationEmail = (user, token) => {
  const url = `${env.frontendUrl}/verify-email?token=${encodeURIComponent(token)}`;
  return sendMail({
    to: user.email,
    subject: 'Verify your Tehilla email',
    text: `Verify your Tehilla email here: ${url}\n\nThis link expires in 24 hours.`,
  });
};

module.exports = {
  isConfigured,
  sendPasswordResetEmail,
  sendVerificationEmail,
};
