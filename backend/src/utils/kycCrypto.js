const crypto = require('crypto');
const env = require('../config/env');

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

const getKey = () => {
  const key = env.kycEncryptionKey;
  if (!key) {
    throw new Error('KYC_ENCRYPTION_KEY is required for KYC field encryption');
  }
  const buf = Buffer.from(key, 'base64');
  if (buf.length !== 32) {
    throw new Error('KYC_ENCRYPTION_KEY must decode to 32 bytes (AES-256)');
  }
  return buf;
};

const encryptField = (plaintext) => {
  if (plaintext === null || plaintext === undefined || plaintext === '') return null;
  const key = getKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const ciphertext = Buffer.concat([cipher.update(String(plaintext), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, ciphertext]).toString('base64');
};

const decryptField = (cipherText) => {
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

const maskField = (plaintext) => {
  if (!plaintext) return null;
  const str = String(plaintext);
  if (str.length <= 4) return '*'.repeat(str.length);
  return `${str.slice(0, 2)}${'*'.repeat(Math.max(str.length - 4, 1))}${str.slice(-2)}`;
};

const maskCipher = (cipherText) => {
  if (!cipherText) return null;
  try {
    return maskField(decryptField(cipherText));
  } catch {
    return '••••';
  }
};

const isCipherConfigured = () => Boolean(env.kycEncryptionKey);

module.exports = {
  decryptField,
  encryptField,
  isCipherConfigured,
  maskCipher,
  maskField,
};
