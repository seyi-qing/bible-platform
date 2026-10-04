# Integration Test Suite

The integration suite runs against disposable PostgreSQL and Redis services.

## Scenarios covered by the smoke suite

- Register two users.
- Verify authentication tokens are returned.
- Verify unauthenticated admin access is rejected.
- Create a private reading plan as User A.
- Verify User B cannot read User A's private plan.
- Rotate a refresh token.
- Verify the old refresh token cannot be reused.

Additional regression suites should be added for notes, highlights, bookmarks, sync ownership, group membership, reports, admin role enforcement, and worker idempotency.
