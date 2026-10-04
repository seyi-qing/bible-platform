CREATE TABLE IF NOT EXISTS bible_versions (
  id INTEGER PRIMARY KEY,
  abbreviation VARCHAR(30) NOT NULL,
  title VARCHAR(255) NOT NULL,
  language_tag VARCHAR(35) NOT NULL,
  copyright TEXT,
  publisher_url TEXT,
  licensed_for_app BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bible_verses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version_id INTEGER NOT NULL,
  book_id VARCHAR(3) NOT NULL,
  chapter INTEGER NOT NULL,
  verse INTEGER NOT NULL,
  reference VARCHAR(80) NOT NULL,
  text TEXT NOT NULL,
  search_text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT bible_verses_version_reference_unique UNIQUE (version_id, reference)
);

CREATE INDEX IF NOT EXISTS bible_verses_version_book_chapter_idx
  ON bible_verses(version_id, book_id, chapter, verse);

CREATE INDEX IF NOT EXISTS bible_verses_search_idx
  ON bible_verses USING GIN (to_tsvector('simple', search_text));
