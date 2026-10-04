# Audio Architecture

Audio is intentionally separated from Bible text. A license to display a Bible translation does not automatically grant permission to redistribute its audio.

## Delivery

1. API authenticates the user.
2. API checks the app/content license.
3. API resolves an audio track from PostgreSQL.
4. API issues a short-lived signed CDN/object-storage URL.
5. Mobile/web client streams from the CDN rather than through the NestJS process.
6. Playback position is periodically synchronized.

## Production storage

Use S3-compatible object storage and a CDN. Store only metadata and storage keys in PostgreSQL. Never put long-lived storage credentials in the client.

## Playback state

Persist position on pause, track changes, app backgrounding, and at a periodic interval. The server uses the latest trusted revision/device timestamp to reconcile multiple devices.

## Offline

Downloaded audio must be restricted by the specific content license. Offline files should be encrypted/obfuscated where required by the provider and removed when a license expires.

## Background playback

Expo's current `expo-audio` supports background playback and lock-screen controls through its config plugin. The exact package version should be installed with `npx expo install expo-audio` so it matches the project's Expo SDK. See the official Expo Audio documentation for the SDK-specific version. 
