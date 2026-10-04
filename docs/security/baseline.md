# Security baseline

- Secrets only on the server; never ship provider keys in mobile/web bundles.
- Validate every external input with schemas.
- Enforce authorization at the service layer, not only in UI routes.
- Hash passwords with a modern password hashing algorithm; use rotating refresh tokens for production auth.
- Add rate limits to authentication, AI and search endpoints.
- Keep private journal content out of analytics.
- Maintain audit logs for security-sensitive actions.
- Support session revocation, account export and account deletion.
- Run dependency and secret scanning in CI.
