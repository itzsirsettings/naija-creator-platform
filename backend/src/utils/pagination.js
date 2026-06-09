const clampLimit = (value, fallback = 20, max = 50) => {
  const numeric = Number(value || fallback);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.min(Math.max(Math.trunc(numeric), 1), max);
};

const encodeCursor = (record) => {
  if (!record?.id || !record?.createdAt) return null;
  return Buffer.from(JSON.stringify({ id: record.id, createdAt: record.createdAt })).toString('base64url');
};

const decodeCursor = (cursor) => {
  if (!cursor) return null;
  try {
    const parsed = JSON.parse(Buffer.from(String(cursor), 'base64url').toString('utf8'));
    if (!parsed.id || !parsed.createdAt) return null;
    return { id: parsed.id, createdAt: new Date(parsed.createdAt) };
  } catch {
    return null;
  }
};

const buildCursorWhere = (cursor) => {
  const decoded = decodeCursor(cursor);
  if (!decoded) return {};

  return {
    OR: [
      { createdAt: { lt: decoded.createdAt } },
      { createdAt: decoded.createdAt, id: { lt: decoded.id } },
    ],
  };
};

const pageResponse = (items, limit, key) => ({
  [key]: items.slice(0, limit),
  limit,
  nextCursor: items.length > limit ? encodeCursor(items[limit - 1]) : null,
});

module.exports = {
  buildCursorWhere,
  clampLimit,
  decodeCursor,
  encodeCursor,
  pageResponse,
};
