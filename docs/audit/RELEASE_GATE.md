# Release Candidate Gate

A release candidate is not production-approved until CI proves all of the following:

1. `pnpm install --frozen-lockfile`
2. `pnpm typecheck`
3. `pnpm lint`
4. Unit tests
5. PostgreSQL integration tests against a disposable database
6. Redis/queue integration tests
7. Playwright E2E tests
8. Database migrations from an empty database and from the previous production version
9. Authorization regression tests for every user-owned resource
10. Dependency and container vulnerability scanning
11. Production image build
12. Health/readiness smoke test
13. Backup and restore test
14. Rollback test
15. Licensed Bible text/audio verification

For Playwright CI failures, keep traces on the first retry rather than tracing every test; this is the documented CI diagnostic pattern. citeturn0search3turn0search7

API authorization should be reviewed against the OWASP API Security Top 10. In particular, every endpoint that accepts an object identifier must verify that the authenticated principal is authorized for that object. citeturn0search0turn0search4
