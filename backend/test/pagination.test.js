import { describe, expect, it } from 'vitest';
import pagination from '../src/utils/pagination.js';

const { buildCursorWhere, clampLimit, decodeCursor, encodeCursor, pageResponse } = pagination;

describe('cursor pagination utilities', () => {
  it('caps list limits for high-volume endpoints', () => {
    expect(clampLimit(200)).toBe(50);
    expect(clampLimit(0)).toBe(20);
    expect(clampLimit(12)).toBe(12);
  });

  it('round-trips cursor payloads and builds stable where clauses', () => {
    const createdAt = new Date('2026-06-04T12:00:00.000Z');
    const cursor = encodeCursor({ id: 'abc', createdAt });

    expect(decodeCursor(cursor)).toMatchObject({ id: 'abc', createdAt });
    expect(buildCursorWhere(cursor)).toEqual({
      OR: [
        { createdAt: { lt: createdAt } },
        { createdAt, id: { lt: 'abc' } },
      ],
    });
  });

  it('returns one extra-row cursor without exposing the extra row', () => {
    const rows = [
      { id: '3', createdAt: new Date('2026-06-04T12:00:03.000Z') },
      { id: '2', createdAt: new Date('2026-06-04T12:00:02.000Z') },
      { id: '1', createdAt: new Date('2026-06-04T12:00:01.000Z') },
    ];

    const response = pageResponse(rows, 2, 'items');
    expect(response.items).toHaveLength(2);
    expect(response.nextCursor).toBeTruthy();
  });
});
