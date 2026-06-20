import type {
  PaymentProvider,
  InitTransactionParams,
  InitTransactionResult,
  VerifyTransactionResult,
  SendPayoutResult,
  BankInfo,
  BankVerifyResult,
  WebhookVerifyResult,
  RefundResult,
} from './payment.interface';
import { AppError } from '../errors/AppError';

// Flutterwave adapter stub — wire up when PAYMENT_PROVIDER=flutterwave
export class FlutterwaveAdapter implements PaymentProvider {
  readonly name = 'flutterwave';

  isConfigured(): boolean {
    return false; // not yet implemented
  }

  private notImplemented(): never {
    throw new AppError('Flutterwave adapter is not yet implemented', 503);
  }

  initializeTransaction(_params: InitTransactionParams): Promise<InitTransactionResult> {
    return this.notImplemented();
  }

  verifyTransaction(_reference: string): Promise<VerifyTransactionResult> {
    return this.notImplemented();
  }

  sendPayoutKobo(
    _recipientCode: string,
    _amountKobo: number,
    _reason: string,
    _reference: string,
  ): Promise<SendPayoutResult> {
    return this.notImplemented();
  }

  getBanks(_country?: string): Promise<BankInfo[]> {
    return this.notImplemented();
  }

  verifyBankAccount(_accountNumber: string, _bankCode: string): Promise<BankVerifyResult> {
    return this.notImplemented();
  }

  createTransferRecipient(
    _name: string,
    _accountNumber: string,
    _bankCode: string,
  ): Promise<string> {
    return this.notImplemented();
  }

  createRefund(_reference: string, _amountKobo: number): Promise<RefundResult> {
    return this.notImplemented();
  }

  verifyWebhookSignature(_rawBody: Buffer | string, _signature: string): WebhookVerifyResult {
    return this.notImplemented();
  }
}