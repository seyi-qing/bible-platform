# Production Readiness v1.0

## Runtime
- Separate API and worker processes.
- Use managed PostgreSQL and Redis in production.
- Run migrations as an explicit deployment step.
- Configure readiness to verify PostgreSQL and Redis, not just process health.

## Security
- Secrets only in the secret manager/environment.
- Rate-limit authentication, AI, search and write-heavy endpoints.
- Enforce resource ownership and role checks at the service boundary.
- Rotate refresh tokens and revoke sessions on suspicious activity.
- Never log passwords, tokens, private notes, prayer content or full AI prompts by default.
- Maintain audit events for privileged actions.

## Observability
Use OpenTelemetry for traces and metrics. Node.js instrumentation should be initialized before application modules load; use OTLP in production rather than console exporters. OpenTelemetry JS currently treats traces and metrics as stable, while browser instrumentation remains experimental. citeturn0search0turn0search1

## Rate limiting
Use a distributed Redis-backed limiter for horizontally scaled instances. NestJS documents `@nestjs/throttler` as its standard rate-limiting integration. citeturn0search3

## Release gate
A production release requires lint/typecheck, unit tests, integration tests, migration verification, dependency/security checks, container build, health checks and rollback readiness.
