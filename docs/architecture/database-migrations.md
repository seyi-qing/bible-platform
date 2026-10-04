# Database migration policy

Production PostgreSQL changes must be versioned and committed under `database/migrations/`.

Do not use schema auto-creation as the production deployment mechanism. Drizzle supports version-controlled migration workflows and `drizzle-kit migrate`; migration files are the deployment artifact. citeturn0search1turn0search2

Deployment rule:

1. Build application image.
2. Run migrations as a controlled release step.
3. Verify migration success.
4. Start/roll application instances.
5. Never silently mutate production schema from application startup.
