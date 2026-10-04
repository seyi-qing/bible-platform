# Architecture

The platform uses a modular monolith API with isolated workers as the default. This keeps deployment and transactions understandable while leaving clean extraction boundaries for high-load modules.

## Boundaries
- Bible: provider adapters, references, translations, search indexing.
- Study: highlights, bookmarks, notes, history.
- Plans: plans, enrollments, progress.
- Prayer: private journal and answered timeline.
- Community: groups, posts, moderation.
- AI: retrieval, prompts, citations, safety, usage limits.
- Sync: idempotent operation log and conflict handling.
- Notifications: preferences, delivery and background jobs.

## Source of truth
PostgreSQL is authoritative for account data and synced user content. Mobile SQLite is a local cache/offline workspace. Every mutation that can be retried gets an operation ID for idempotency.
