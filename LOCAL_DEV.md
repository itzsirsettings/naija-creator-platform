# Tehilla Local Development

## Start Local Dependencies

The API readiness check needs Postgres. Viral-scale features also use Redis for distributed rate limits, cache, and queues.

```bash
cd backend
npm run infra:up
```

This starts:

- Postgres: `localhost:15432`
- Redis: `localhost:6379`

Use `backend/.env.local.example` for local values.

## Prepare Database

```bash
cd backend
npm run db:generate
npm run db:migrate:deploy
npm run db:seed:demo
```

## Run API

```bash
cd backend
npm start
```

Verify:

```bash
curl http://localhost:5000/health
curl http://localhost:5000/ready
curl http://localhost:5000/metrics
```

Optional local smoke load test:

```bash
docker run --rm -i grafana/k6:latest run -e BASE_URL=http://host.docker.internal:5000 - < ../load/k6-smoke.js
```

## Stop Dependencies

```bash
cd backend
npm run infra:down
```

## Production Difference

Local Docker is only for development. Production should use:

- Supabase Postgres Pro for `DATABASE_URL` and `DIRECT_URL`
- Managed Redis for `REDIS_URL`
- `REDIS_REQUIRED=true`
- `VITE_DEMO_FALLBACK=false`
