# v1.9.0 — Attack & Failure Testing

- Added unauthenticated protected-route regression suite.
- Added malformed-authentication and validation-failure regression suite.
- Added v1.9 attack-testing and release criteria documentation.
- Bumped API and worker package versions to 1.9.0.

# Changelog

## v1.3.0

- Added protected admin API service and DTOs.
- Added administrator overview, user listing, role management, moderation report workflow, and audit-log endpoint.
- Added server-side role enforcement and audit events for privileged mutations.
- Added standalone Next.js admin console at `apps/admin`.
- Added admin architecture/security documentation.
## v1.5.0 — Repository Audit & Security Hardening

- Fixed refresh-token rotation race with compare-and-swap semantics.
- Fixed sync note ownership enforcement.
- Added startup environment validation.
- Added Docker secret support for API/worker PostgreSQL credentials.
- Removed unsafe implicit AI model default.
- Updated Next.js web lint command to a working TypeScript gate.
- Added repository audit and release-gate documentation.

## v1.5.0 — Repository Audit & Security Hardening

- Fixed refresh-token rotation race with compare-and-swap semantics.
- Fixed sync note ownership enforcement.
- Added startup environment validation.
- Added Docker secret support for API/worker PostgreSQL credentials.
- Removed unsafe implicit AI model default.
- Updated Next.js web lint command to a working TypeScript gate.
- Added repository audit and release-gate documentation.

## v1.6 — Workers and background jobs
- Added dedicated BullMQ worker service.
- Added asynchronous AI study jobs and job-status API.
- Added device push-token registration and notification delivery worker.
- Added search-index worker processing.
- Added worker graceful shutdown and retry/backoff policy.
- Added PostgreSQL + Redis readiness checks.
- Added `ai_jobs` migration and notification-device fields.

## 1.7.0 — Production integration hardening
- Added Zod validation exception responses.
- Added dependency-aware API readiness checks for PostgreSQL and Redis.
- Added API liveness endpoint.
- Added Swagger/OpenAPI documentation endpoint.
- Added baseline Nest rate limiting.
- Reused PostgreSQL pools within a process.
- Hardened reading-plan ownership, enrollment, progress, and day bounds.

## v1.8.0 — Full System Verification & Release Engineering
- Added clean-database migration verification script.
- Added API authorization/refresh-token integration smoke test.
- Added repository verification script.
- Added CI PostgreSQL/Redis services and real migration/build/test flow.
- Added Playwright webServer integration for browser smoke tests.
- Added v1.8 verification/release documentation.

## v2.0.0 — Release Engineering

- CI now requires a real `pnpm-lock.yaml` and uses `pnpm install --frozen-lockfile`.
- Added explicit lockfile verification.
- Added authorization matrix and sensitive-business-flow integration boundaries.
- CI installs Playwright Chromium with dependencies before E2E tests.
- CI uploads Playwright reports and API logs on failure.
- Added a documented release contract that distinguishes implemented checks from actually executed checks.
