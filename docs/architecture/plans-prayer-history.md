# Reading Plans, Prayer Journal, and History

## Reading plans

A plan belongs to an owner and contains ordered day records. A user can enroll in a plan and maintain independent completion state for each day. Passage references are stored as structured JSON rather than Bible text, so plan content does not silently duplicate licensed Scripture.

### Why this matters

The same plan can point to different licensed translations at read time. This keeps licensing boundaries cleaner and makes translation switching possible.

## Prayer journal

Prayer entries are private by default. Updates create a chronological journal without overwriting the original prayer history. Status values are `ACTIVE`, `ANSWERED`, and `ARCHIVED`.

The API does not expose prayer content to analytics. Future analytics should use aggregate events only.

## Reading history

Reading history stores a user's most recent progress for a version/reference pair. It is deliberately separate from analytics so product analytics can avoid retaining the user's private reading details unnecessarily.

## Production considerations

- Add rate limits to write endpoints.
- Add audit events for sensitive account actions.
- Add soft-delete/export flows where regulatory or product requirements demand them.
- Encrypt sensitive data at rest through the managed database/storage provider where available.
- Never use Bible text from an upstream provider as a substitute for verifying the application's license.
