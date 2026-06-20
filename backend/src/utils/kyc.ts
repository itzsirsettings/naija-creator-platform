import crypto from 'crypto';
import config from '../config/config';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

const getKey = (): Buffer => {
  const key = config.kycEncryptionKey;
  if (!key) {
    const hint = config.isProduction
      ? 'Set KYC_ENCRYPTION_KEY in your environment. Generate with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'base64\'))"'
      : 'Set KYC_ENCRYPTION_KEY in backend/.env';
    throw new Error(`KYC_ENCRYPTION_KEY is required for KYC field encryption. ${hint}`);
  }
  const buf = Buffer.from(key, 'base64');
  if (buf.length !== 32) {
    throw new Error('KYC_ENCRYPTION_KEY must decode to 32 bytes (AES-256)');
  }
  return buf;
};

export const encryptField = (plaintext: string | null | undefined): string | null => {
  if (plaintext === null || plaintext === undefined || plaintext === '') return null;
  const key = getKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const ciphertext = Buffer.concat([cipher.update(String(plaintext), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, ciphertext]).toString('base64');
};

export const decryptField = (cipherText: string | null | undefined): string | null => {
  if (!cipherText) return null;
  const key = getKey();
  const buf = Buffer.from(cipherText, 'base64');
  if (buf.length < IV_LENGTH + AUTH_TAG_LENGTH) {
    throw new Error('Ciphertext is too short to be valid');
  }
  const iv = buf.subarray(0, IV_LENGTH);
  const tag = buf.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
  const ciphertext = buf.subarray(IV_LENGTH + AUTH_TAG_LENGTH);
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);
  const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return plaintext.toString('utf8');
};

export const maskField = (plaintext: string | null | undefined): string | null => {
  if (!plaintext) return null;
  const str = String(plaintext);
  if (str.length <= 4) return '*'.repeat(str.length);
  return `${str.slice(0, 2)}${'*'.repeat(Math.max(str.length - 4, 1))}${str.slice(-2)}`;
};

export const maskCipher = (cipherText: string | null | undefined): string | null => {
  if (!cipherText) return null;
  try {
    return maskField(decryptField(cipherText));
  } catch {
    return '••••';
  }
};

export const isCipherConfigured = (): boolean => Boolean(config.kycEncryptionKey);