import config from '../config/config';
import { PaystackAdapter } from '../providers/paystack.adapter';
import { FlutterwaveAdapter } from '../providers/flutterwave.adapter';
import type { PaymentProvider } from '../providers/payment.interface';

const paystack = new PaystackAdapter();
const flutterwave = new FlutterwaveAdapter();

const getProvider = (): PaymentProvider => {
  if (config.paymentProvider === 'flutterwave') return flutterwave;
  return paystack;
};

export const paymentProvider: PaymentProvider = {
  get name() {
    return getProvider().name;
  },
  isConfigured: () => getProvider().isConfigured(),
  initializeTransaction: (p) => getProvider().initializeTransaction(p),
  verifyTransaction: (ref) => getProvider().verifyTransaction(ref),
  sendPayoutKobo: (code, amount, reason, ref) =>
    getProvider().sendPayoutKobo(code, amount, reason, ref),
  getBanks: (country) => getProvider().getBanks(country),
  verifyBankAccount: (acctNo, bankCode) => getProvider().verifyBankAccount(acctNo, bankCode),
  createTransferRecipient: (name, acctNo, bankCode) =>
    getProvider().createTransferRecipient(name, acctNo, bankCode),
  createRefund: (reference, amountKobo) => getProvider().createRefund(reference, amountKobo),
  verifyWebhookSignature: (raw, sig) => getProvider().verifyWebhookSignature(raw, sig),
};

// Export adapters for webhook routing (each provider has its own webhook endpoint)
export { paystack, flutterwave };