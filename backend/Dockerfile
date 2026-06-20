# ─── Stage 1: Build ───────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --ignore-scripts

COPY tsconfig.json ./
COPY src ./src

RUN npm run build

# ─── Stage 2: Production image ────────────────────────────────────────────────
FROM node:22-alpine AS runner

RUN addgroup -g 1001 -S nodejs && adduser -S tehilla -u 1001

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts

# Copy Prisma schema and generate client
COPY --from=builder /app/src/prisma ./src/prisma
RUN npx prisma generate --schema src/prisma/schema.prisma

COPY --from=builder /app/dist ./dist

USER tehilla

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:5000/health || exit 1

CMD ["node", "dist/app.js"]