# Reader Architecture

The reader is deliberately split into three concerns: Bible retrieval, reader state, and personal study actions. Bible text never comes from hard-coded UI content.

## Provider boundary

The API owns provider credentials. The browser receives only the passage payload. This prevents an App Key from being shipped to clients. YouVersion currently requires `X-YVP-App-Key` and applies licensing to content access, so the server/provider boundary is mandatory.

## Search

Bible search uses PostgreSQL full-text search against locally indexed licensed verses. This avoids making every keystroke an upstream provider request and gives us a path to ranking, phrase search and semantic search later.

## Interaction model

A verse can become the selected reading unit. The same reference is used by highlights, notes, bookmarks, sharing and AI citations. This keeps the reader and study system consistent across web and mobile.
