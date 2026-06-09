const KOBO_PER_NAIRA = 100;
const PLATFORM_FEE_RATE_BPS = 1000;
const BASIS_POINTS = 10000;

const toKobo = (value) => {
  const numeric = Number(value || 0);
  if (!Number.isFinite(numeric)) return 0;
  return Math.round(numeric * KOBO_PER_NAIRA);
};

const fromKobo = (value) => Math.round(Number(value || 0)) / KOBO_PER_NAIRA;

const calculateSplitKobo = (amountKobo) => {
  const grossKobo = Math.round(Number(amountKobo || 0));
  const feeKobo = Math.round((grossKobo * PLATFORM_FEE_RATE_BPS) / BASIS_POINTS);
  const netKobo = grossKobo - feeKobo;

  return { grossKobo, feeKobo, netKobo };
};

const addLegacyMoneyFields = (record) => {
  if (!record || typeof record !== 'object') return record;

  const next = { ...record };
  if (next.amountKobo !== undefined && next.amount === undefined) next.amount = fromKobo(next.amountKobo);
  if (next.grossKobo !== undefined && next.grossAmount === undefined) next.grossAmount = fromKobo(next.grossKobo);
  if (next.feeKobo !== undefined && next.platformFee === undefined) next.platformFee = fromKobo(next.feeKobo);
  if (next.netKobo !== undefined && next.netAmount === undefined) next.netAmount = fromKobo(next.netKobo);
  if (next.balanceKobo !== undefined && next.balance === undefined) next.balance = fromKobo(next.balanceKobo);
  return next;
};

module.exports = {
  BASIS_POINTS,
  KOBO_PER_NAIRA,
  PLATFORM_FEE_RATE_BPS,
  addLegacyMoneyFields,
  calculateSplitKobo,
  fromKobo,
  toKobo,
};
