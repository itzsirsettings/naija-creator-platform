import { describe, it, expect } from 'vitest';
import { toKobo, fromKobo, calculateSplitKobo, PLATFORM_FEE_RATE_BPS } from '../src/utils/money';

describe('money.toKobo', () => {
  it('converts naira to kobo', () => {
    expect(toKobo(100)).toBe(10000);
    expect(toKobo(50.5)).toBe(5050);
  });

  it('returns 0 for non-finite / invalid input', () => {
    expect(toKobo(0)).toBe(0);
    expect(toKobo('abc' as unknown as number)).toBe(0);
    expect(toKobo(Number.NaN)).toBe(0);
  });
});

describe('money.fromKobo', () => {
  it('round-trips with toKobo for whole and half naira', () => {
    for (const naira of [1, 100, 2500, 50.5, 999.99]) {
      expect(fromKobo(toKobo(naira))).toBeCloseTo(naira, 2);
    }
  });
});

describe('money.calculateSplitKobo', () => {
  it('takes a 10% platform fee', () => {
    expect(PLATFORM_FEE_RATE_BPS).toBe(1000);
    const split = calculateSplitKobo(100_000); // ₦1,000.00
    expect(split.grossKobo).toBe(100_000);
    expect(split.feeKobo).toBe(10_000);
    expect(split.netKobo).toBe(90_000);
  });

  it('never loses or invents money to rounding: fee + net === gross', () => {
    for (const amount of [1, 7, 13, 333, 9_999, 99_999, 100_001, 12_345, 7_777_777]) {
      const { grossKobo, feeKobo, netKobo } = calculateSplitKobo(amount);
      expect(grossKobo).toBe(amount);
      expect(feeKobo + netKobo).toBe(grossKobo);
      expect(feeKobo).toBeGreaterThanOrEqual(0);
      expect(netKobo).toBeGreaterThanOrEqual(0);
    }
  });
});
