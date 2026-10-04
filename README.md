**Release line: v2.0.0 — Release Engineering**

# Bible Platform

A production-oriented Bible study platform built as a TypeScript monorepo.

## v1.0 scope
The repository now contains the cumulative foundation for Bible reading, search, authentication, personal study, offline sync, plans, prayer, AI study, community, audio architecture, queues and production-hardening boundaries.

## Important
This repository is a software foundation, not a claim that external services are already configured. You must supply licensed Bible content/provider credentials, AI credentials, push credentials, media/CDN configuration and production secrets.

## Production commands
```bash
pnpm install
pnpm typecheck
pnpm test
pnpm build
```

Start infrastructure locally:
```bash
docker compose up -d
```

Run database migrations with the repository's migration tooling before starting production services.

## Architecture
- `apps/web`: Next.js web client
- `apps/mobile`: Expo React Native client
- `services/api`: NestJS API
- `packages/*`: shared TypeScript packages
- `database/migrations`: versioned PostgreSQL migrations
- `docs`: architecture, security, licensing and operations documentation

## Production rule
Do not expose Bible-provider keys, AI keys, refresh tokens or storage credentials to web/mobile clients. Keep provider access and privileged operations on the server.


## v1.2 security integration pass

The API now wires all feature modules into the Nest application, protects administrative routes with a database-backed role guard, fixes Express authorization-header parsing, protects internal indexing from anonymous access, and closes an object-ID ownership hole in offline synchronization. See `docs/security/v1.2-authorization-regression.md`.

## v1.3 Admin and moderation console

The repository now includes a protected Next.js administration surface at `apps/admin` and a privileged NestJS `/api/v1/admin` module. Admin access is enforced server-side with authentication plus role authorization; the browser UI is not considered a security boundary. The API records privileged role changes and moderation decisions in `audit_logs`.

The admin architecture follows Nest's authorization model: authentication establishes identity, while authorization guards enforce role/resource access. See https://docs.nestjs.com/security/authorization.
