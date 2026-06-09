import { describe, expect, it } from 'vitest';
import money from '../src/utils/money.js';

const { addLegacyMoneyFields, calculateSplitKobo, fromKobo, toKobo } = money;

describe('money utilities', () => {
  it('converts naira to integer kobo without floating point drift', () => {
    expect(toKobo(750000)).toBe(75000000);
    expect(toKobo(123.45)).toBe(12345);
  });

  it('calculates the 10 percent platform fee in kobo', () => {
    expect(calculateSplitKobo(75000000)).toEqual({
      grossKobo: 75000000,
      feeKobo: 7500000,
      netKobo: 67500000,
    });
  });

  it('adds backward-compatible naira fields to API records', () => {
    expect(addLegacyMoneyFields({ amountKobo: 250050, netKobo: 200000, balanceKobo: 9900 })).toMatchObject({
      amount: 2500.5,
      netAmount: 2000,
      balance: 99,
    });
    expect(fromKobo(12345)).toBe(123.45);
  });
});
