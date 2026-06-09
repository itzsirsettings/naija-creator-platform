const axios = require('axios');
const crypto = require('crypto');
const env = require('../config/env');
const { callWithCircuitBreaker } = require('../lib/circuitBreaker');

const PAYSTACK_BASE = 'https://api.paystack.co';

const isConfigured = () => {
  const key = env.paystackSecretKey;
  return key && !key.includes('your_paystack_key') && !key.includes('your_');
};

const canUseMock = () => env.paymentMocksEnabled && !env.isProduction;

const requireConfigured = () => {
  if (isConfigured()) return;
  const err = new Error('Paystack is not configured');
  err.statusCode = 503;
  throw err;
};

const headers = () => ({
  Authorization: `Bearer ${env.paystackSecretKey}`,
  'Content-Type': 'application/json',
});

const parseRawJsonBody = (rawBody) => JSON.parse(Buffer.isBuffer(rawBody) ? rawBody.toString('utf8') : rawBody);

const verifyWebhookSignature = (rawBody, signature) => {
  if (!isConfigured()) {
    if (!canUseMock()) {
      const err = new Error('Paystack webhook cannot be verified because Paystack is not configured');
      err.statusCode = 503;
      throw err;
    }
    return parseRawJsonBody(rawBody);
  }

  if (!signature) {
    const err = new Error('Missing Paystack webhook signature');
    err.statusCode = 400;
    throw err;
  }

  const rawText = Buffer.isBuffer(rawBody) ? rawBody.toString('utf8') : JSON.stringify(rawBody);
  const body = JSON.parse(rawText);
  const expected = crypto.createHmac('sha512', env.paystackSecretKey).update(rawText).digest('hex');

  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(signature);

  if (expectedBuffer.length !== receivedBuffer.length || !crypto.timingSafeEqual(expectedBuffer, receivedBuffer)) {
    const err = new Error('Invalid Paystack webhook signature');
    err.statusCode = 400;
    throw err;
  }

  return body;
};

const initializeTransaction = async ({ email, amountKobo, reference, callbackUrl, metadata = {} }) => {
  if (!isConfigured()) {
    if (!canUseMock()) requireConfigured();
    return {
      mode: 'mock',
      authorizationUrl: `${env.frontendUrl}/payments?reference=${encodeURIComponent(reference)}&status=success`,
      checkoutUrl: `${env.frontendUrl}/payments?reference=${encodeURIComponent(reference)}&status=success`,
      reference,
      paystackRef: reference,
      amountKobo: Math.round(amountKobo),
      currency: 'ngn',
    };
  }

  const res = await callWithCircuitBreaker(
    'paystack.transaction.initialize',
    () => axios.post(
      `${PAYSTACK_BASE}/transaction/initialize`,
      {
        email,
        amount: Math.round(amountKobo),
        reference,
        currency: 'NGN',
        callback_url: callbackUrl || `${env.frontendUrl}/payments`,
        metadata,
      },
      { headers: headers() },
    ),
    { provider: 'paystack', operationName: 'transaction_initialize' },
  );

  if (!res.data?.status || !res.data?.data?.authorization_url) {
    const err = new Error(res.data?.message || 'Paystack transaction initialization failed');
    err.statusCode = 502;
    throw err;
  }

  return {
    mode: 'paystack',
    authorizationUrl: res.data.data.authorization_url,
    checkoutUrl: res.data.data.authorization_url,
    accessCode: res.data.data.access_code,
    reference: res.data.data.reference || reference,
    paystackRef: res.data.data.reference || reference,
    amountKobo: Math.round(amountKobo),
    currency: 'ngn',
  };
};

const verifyTransaction = async (reference) => {
  if (!isConfigured()) {
    if (!canUseMock()) requireConfigured();
    return {
      status: true,
      data: {
        status: 'success',
        reference,
        currency: 'NGN',
      },
    };
  }

  const res = await callWithCircuitBreaker(
    'paystack.transaction.verify',
    () => axios.get(`${PAYSTACK_BASE}/transaction/verify/${encodeURIComponent(reference)}`, { headers: headers() }),
    { provider: 'paystack', operationName: 'transaction_verify' },
  );

  return res.data;
};

const getBanks = async (country = 'NG') => {
  if (!isConfigured()) {
    if (!canUseMock()) requireConfigured();
    return [
      { name: 'GTBank', code: '058', slug: 'gtbank' },
      { name: 'Kuda Bank', code: '50211', slug: 'kuda-bank' },
      { name: 'OPay Digital Services', code: '999992', slug: 'opay' },
    ];
  }

  const res = await callWithCircuitBreaker(
    'paystack.bank.list',
    () => axios.get(`${PAYSTACK_BASE}/bank?country=${country}&currency=NGN`, { headers: headers() }),
    { provider: 'paystack', operationName: 'bank_list' },
  );
  return res.data.data || [];
};

const verifyBankAccount = async (accountNumber, bankCode) => {
  if (!isConfigured()) {
    if (!canUseMock()) requireConfigured();
    return {
      status: true,
      data: {
        account_name: 'Demo Creator',
        account_number: accountNumber,
        bank_code: bankCode,
      },
    };
  }

  const res = await callWithCircuitBreaker(
    'paystack.bank.resolve',
    () => axios.get(
      `${PAYSTACK_BASE}/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`,
      { headers: headers() },
    ),
    { provider: 'paystack', operationName: 'bank_resolve' },
  );
  return res.data;
};

const createTransferRecipient = async (name, accountNumber, bankCode) => {
  if (!isConfigured()) {
    if (!canUseMock()) requireConfigured();
    return `demo_recipient_${Date.now()}`;
  }

  const res = await callWithCircuitBreaker(
    'paystack.transferrecipient.create',
    () => axios.post(
      `${PAYSTACK_BASE}/transferrecipient`,
      {
        type: 'nuban',
        name,
        account_number: accountNumber,
        bank_code: bankCode,
        currency: 'NGN',
      },
      { headers: headers() },
    ),
    { provider: 'paystack', operationName: 'transfer_recipient_create' },
  );
  return res.data.data.recipient_code;
};

const sendPayoutKobo = async (recipientCode, amountKobo, reason, reference) => {
  if (!isConfigured()) {
    if (!canUseMock()) requireConfigured();
    return {
      status: true,
      reference: reference || `demo_transfer_${Date.now()}`,
      data: {
        transfer_code: reference || `demo_transfer_${Date.now()}`,
        recipient: recipientCode,
        amount: amountKobo,
        reason,
      },
    };
  }

  const res = await callWithCircuitBreaker(
    'paystack.transfer.create',
    () => axios.post(
      `${PAYSTACK_BASE}/transfer`,
      {
        source: 'balance',
        amount: Math.round(amountKobo),
        recipient: recipientCode,
        reason,
        reference,
      },
      { headers: headers() },
    ),
    { provider: 'paystack', operationName: 'transfer_create' },
  );
  return res.data;
};

module.exports = {
  createTransferRecipient,
  getBanks,
  initializeTransaction,
  isConfigured,
  requireConfigured,
  sendPayoutKobo,
  verifyBankAccount,
  verifyTransaction,
  verifyWebhookSignature,
};
