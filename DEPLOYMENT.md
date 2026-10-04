# Deployment quickstart

1. Copy `.env.production.example` to a secret-managed production configuration.
2. Generate strong JWT secrets.
3. Create `secrets/postgres_password.txt` outside source control.
4. Configure the licensed Bible providers and AI provider credentials server-side.
5. Provision PostgreSQL, Redis and object storage.
6. Run migrations.
7. Start API and worker containers.
8. Verify `/api/v1/health/live` and `/api/v1/health/ready`.
9. Deploy web and admin.
10. Run smoke tests and monitor.

The production Compose file is a deployment reference. For a managed-cloud deployment, map these services to the corresponding managed database, cache, container and object-storage products.
