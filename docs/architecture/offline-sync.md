# Offline-first synchronization

The mobile client treats SQLite as its local working database. PostgreSQL remains the server source of truth.

## Flow

1. A local write updates SQLite immediately.
2. The client writes an immutable operation into `sync_queue`.
3. When connectivity is available, queued operations are sent to `POST /api/v1/sync/push`.
4. The server validates device ownership, applies the operation and records the operation ID.
5. A repeated operation ID is ignored, making retries idempotent.
6. The client removes successfully accepted/duplicate operations from its queue.
7. The client calls `POST /api/v1/sync/pull` using its last cursor.
8. Server operations are applied locally and the cursor is advanced.

## Conflict policy

v0.5 uses a deliberately conservative last-write-wins foundation for mutable records. The operation log is retained so this can later evolve into entity-specific conflict policies without changing the transport protocol.

Notes should eventually use an explicit `updatedAt` comparison and surface a conflict when two devices changed the same note from different base revisions. Bible reading progress can safely merge by choosing the highest progress for the same reading target, while highlights/bookmarks are naturally set-like.

## Security

- Device IDs are scoped to the authenticated user.
- The server never trusts a device ID supplied by another account.
- Operation IDs are unique and make network retries idempotent.
- Payloads are validated before mutation.
- Access tokens stay outside SQLite's content tables; production token storage should use platform secure storage.

## SQLite

The current implementation uses `expo-sqlite`, WAL mode, parameterized statements and exclusive transactions for queue deletion. Expo documents SQLite as persisted across app restarts and recommends WAL for general performance. citeturn0search0
