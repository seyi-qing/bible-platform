# Threat Model

Primary assets: accounts, sessions, private notes, prayer journals, highlights, group data, AI conversations, licensed Bible content and operational secrets.

Threats include credential stuffing, token theft, broken object-level authorization, prompt injection, data exfiltration, abusive community content, provider outages, replayed sync operations and accidental licensed-content redistribution.

Controls:
- password hashing and refresh-token rotation
- ownership checks on every user-scoped resource
- short-lived access tokens
- rate limits and abuse controls
- server-side provider credentials
- idempotent sync operations
- moderation/reporting workflow
- audit logging
- least-privilege workers
- content licensing metadata
- encrypted transport and encrypted managed storage
