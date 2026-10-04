# Authentication

The API uses short-lived access JWTs (15 minutes) and rotating refresh tokens (30 days by default).

## Rules
- Passwords are never stored directly; the foundation uses Node's built-in `scrypt` with a random salt.
- Refresh tokens are stored only as SHA-256 hashes.
- Every refresh rotates the token, limiting replay usefulness.
- Sessions can be revoked individually.
- Access tokens contain `sub` (user id) and `sid` (session id).
- OAuth/passkeys are intentionally provider adapters to be added without changing the session model.

## Production hardening still required
- email verification and password reset flows
- breached-password screening
- MFA/passkeys
- OAuth provider verification and account-linking rules
- login throttling/IP reputation
- centralized secrets management
- security event alerting
