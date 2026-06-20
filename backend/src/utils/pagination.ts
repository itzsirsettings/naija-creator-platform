export const clampLimit = (value: unknown, fallback = 20, max = 50): number => {
  const numeric = Number(value ?? fallback);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.min(Math.max(Math.trunc(numeric), 1), max);
};

interface CursorPayload {
  id: string;
  createdAt: Date | string;
}

export const encodeCursor = (record: CursorPayload | null | undefined): string | null => {
  if (!record?.id || !record?.createdAt) return null;
  return Buffer.from(JSON.stringify({ id: record.id, createdAt: record.createdAt })).toString(
    'base64url',
  );
};

export const decodeCursor = (cursor: string | undefined | null): CursorPayload | null => {
  if (!cursor) return null;
  try {
    const parsed = JSON.parse(Buffer.from(String(cursor), 'base64url').toString('utf8')) as unknown;
    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      !('id' in parsed) ||
      !('createdAt' in parsed)
    )
      return null;
    const p = parsed as Record<string, unknown>;
    return { id: String(p['id']), createdAt: new Date(String(p['createdAt'])) };
  } catch {
    return null;
  }
};

export interface CursorWhere {
  OR?: Array<
    | { createdAt: { lt: Date } }
    | { createdAt: Date; id: { lt: string } }
  >;
}

export const buildCursorWhere = (cursor: string | undefined | null): CursorWhere => {
  const decoded = decodeCursor(cursor);
  if (!decoded) return {};

  return {
    OR: [
      { createdAt: { lt: new Date(decoded.createdAt) } },
      { createdAt: new Date(decoded.createdAt), id: { lt: decoded.id } },
    ],
  };
};

export interface PageResponse<T> {
  [key: string]: unknown;
  limit: number;
  nextCursor: string | null;
}

export const pageResponse = <T extends CursorPayload>(
  items: T[],
  limit: number,
  key: string,
): Record<string, unknown> => ({
  [key]: items.slice(0, limit),
  limit,
  nextCursor: items.length > limit ? encodeCursor(items[limit - 1]) : null,
});