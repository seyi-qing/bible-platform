# Production deployment

## Required services

- Next.js web/admin hosting
- NestJS API
- dedicated worker process
- PostgreSQL 17+
- Redis 8+
- object storage/CDN for media

## Rules

1. Never commit `.env.production` or secret files.
2. Run versioned database migrations before application rollout.
3. Keep API and worker deployments independently scalable.
4. Configure readiness/liveness probes.
5. Use TLS at the edge and private networking for PostgreSQL/Redis.
6. Back up PostgreSQL and regularly test restores.
7. Store Bible/audio provider credentials server-side only.
8. Monitor queue depth, DB connections, error rate, latency and provider failures.

## Rollout

1. Build immutable images.
2. Run CI checks.
3. Apply migrations.
4. Deploy worker.
5. Deploy API.
6. Run smoke tests.
7. Deploy web/admin.
8. Monitor for errors before increasing traffic.

## Rollback

Application images must be independently versioned. Database migrations must be backward-compatible with the previous application version whenever a rolling deployment is possible. Destructive migrations require a separate maintenance plan and verified backup.
