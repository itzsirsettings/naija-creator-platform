import axios from 'axios';
import nodemailer from 'nodemailer';
import config from '../config/config';
import logger from '../lib/logger';
import { AppError } from '../errors/AppError';

interface MailOptions {
  to: string;
  subject: string;
  text: string;
}

let transporter: ReturnType<typeof nodemailer.createTransport> | null = null;

const hasSmtpConfig = () =>
  Boolean(config.smtpHost && config.smtpUser && config.smtpPass && config.emailFrom);

const hasResendConfig = () => Boolean(config.resendApiKey && config.emailFrom);

export const isConfigured = () => hasResendConfig() || hasSmtpConfig();

const getTransporter = () => {
  if (!hasSmtpConfig()) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: config.smtpHost,
      port: config.smtpPort,
      secure: config.smtpPort === 465,
      auth: { user: config.smtpUser, pass: config.smtpPass },
    });
  }
  return transporter;
};

const sendWithResend = async ({ to, subject, text }: MailOptions): Promise<void> => {
  try {
    await axios.post(
      'https://api.resend.com/emails',
      { from: config.emailFrom, to: [to], subject, text },
      {
        headers: {
          Authorization: `Bearer ${config.resendApiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: config.requestTimeoutMs,
      },
    );
  } catch (error) {
    const axiosErr = error as { response?: { data?: unknown }; message?: string };
    logger.error({ err: axiosErr.response?.data ?? axiosErr.message, to, subject }, 'resend email failed');
    throw new AppError('Email provider could not send the message', 502);
  }
};

export const sendMail = async ({ to, subject, text }: MailOptions): Promise<void> => {
  if (config.resendApiKey) {
    return sendWithResend({ to, subject, text });
  }

  const mailer = getTransporter();
  if (!mailer) {
    if (config.isProduction) {
      throw new AppError('Email transport is not configured', 503);
    }
    logger.info({ to, subject, text }, 'email preview (no transport configured)');
    return;
  }

  await mailer.sendMail({ from: config.emailFrom, to, subject, text });
};

export const sendPasswordResetEmail = (
  user: { email: string },
  token: string,
): Promise<void> => {
  const url = `${config.frontendUrl}/reset-password?token=${encodeURIComponent(token)}`;
  return sendMail({
    to: user.email,
    subject: 'Reset your Tehilla password',
    text: `Reset your Tehilla password here: ${url}\n\nThis link expires in 30 minutes.`,
  });
};

export const sendVerificationEmail = (
  user: { email: string },
  token: string,
): Promise<void> => {
  const url = `${config.frontendUrl}/verify-email?token=${encodeURIComponent(token)}`;
  return sendMail({
    to: user.email,
    subject: 'Verify your Tehilla email',
    text: `Verify your Tehilla email here: ${url}\n\nThis link expires in 24 hours.`,
  });
};