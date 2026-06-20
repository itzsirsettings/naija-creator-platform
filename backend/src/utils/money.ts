export const KOBO_PER_NAIRA = 100;
export const PLATFORM_FEE_RATE_BPS = 1000; // 10%
export const BASIS_POINTS = 10_000;

export const toKobo = (value: number | string): number => {
  const numeric = Number(value ?? 0);
  if (!Number.isFinite(numeric)) return 0;
  return Math.round(numeric * KOBO_PER_NAIRA);
};

export const fromKobo = (value: number | string): number =>
  Math.round(Number(value ?? 0)) / KOBO_PER_NAIRA;

export interface SplitResult {
  grossKobo: number;
  feeKobo: number;
  netKobo: number;
}

export const calculateSplitKobo = (amountKobo: number): SplitResult => {
  const grossKobo = Math.round(Number(amountKobo ?? 0));
  const feeKobo = Math.round((grossKobo * PLATFORM_FEE_RATE_BPS) / BASIS_POINTS);
  const netKobo = grossKobo - feeKobo;
  return { grossKobo, feeKobo, netKobo };
};

export const addMoneyFields = <T extends Record<string, unknown>>(record: T): T & {
  amount?: number;
  grossAmount?: number;
  platformFee?: number;
  netAmount?: number;
  balance?: number;
  held?: number;
} => {
  if (!record || typeof record !== 'object') return record;
  const next = { ...record } as Record<string, unknown>;
  if (next['amountKobo'] !== undefined && next['amount'] === undefined)
    next['amount'] = fromKobo(next['amountKobo'] as number);
  if (next['grossKobo'] !== undefined && next['grossAmount'] === undefined)
    next['grossAmount'] = fromKobo(next['grossKobo'] as number);
  if (next['feeKobo'] !== undefined && next['platformFee'] === undefined)
    next['platformFee'] = fromKobo(next['feeKobo'] as number);
  if (next['netKobo'] !== undefined && next['netAmount'] === undefined)
    next['netAmount'] = fromKobo(next['netKobo'] as number);
  if (next['balanceKobo'] !== undefined && next['balance'] === undefined)
    next['balance'] = fromKobo(next['balanceKobo'] as number);
  if (next['heldKobo'] !== undefined && next['held'] === undefined)
    next['held'] = fromKobo(next['heldKobo'] as number);
  return next as T & Record<string, unknown>;
};