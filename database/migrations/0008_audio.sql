-- Audio catalog and playback synchronization.
CREATE TABLE IF NOT EXISTS audio_tracks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version_id integer NOT NULL,
  book_id varchar(32) NOT NULL,
  chapter integer NOT NULL,
  title varchar(255) NOT NULL,
  duration_seconds integer NOT NULL CHECK (duration_seconds > 0),
  storage_key text NOT NULL,
  mime_type varchar(100) NOT NULL DEFAULT 'audio/mpeg',
  license_id varchar(255),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(version_id, book_id, chapter)
);

CREATE INDEX IF NOT EXISTS audio_tracks_lookup_idx ON audio_tracks(version_id, book_id, chapter);

CREATE TABLE IF NOT EXISTS audio_playback_positions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  track_id uuid NOT NULL REFERENCES audio_tracks(id) ON DELETE CASCADE,
  position_seconds integer NOT NULL DEFAULT 0 CHECK (position_seconds >= 0),
  completed boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, track_id)
);

CREATE INDEX IF NOT EXISTS audio_playback_user_updated_idx ON audio_playback_positions(user_id, updated_at DESC);

CREATE TABLE IF NOT EXISTS media_downloads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  track_id uuid NOT NULL REFERENCES audio_tracks(id) ON DELETE CASCADE,
  status varchar(32) NOT NULL DEFAULT 'QUEUED',
  progress integer NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, track_id)
);
