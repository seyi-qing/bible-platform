CREATE TABLE IF NOT EXISTS reading_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title varchar(160) NOT NULL,
  description text,
  total_days integer NOT NULL CHECK (total_days > 0 AND total_days <= 365),
  visibility varchar(20) NOT NULL DEFAULT 'PRIVATE',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS reading_plans_owner_idx ON reading_plans(owner_user_id, updated_at DESC);

CREATE TABLE IF NOT EXISTS reading_plan_days (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id uuid NOT NULL REFERENCES reading_plans(id) ON DELETE CASCADE,
  day_number integer NOT NULL CHECK (day_number > 0 AND day_number <= 365),
  title varchar(160),
  passages jsonb NOT NULL,
  UNIQUE(plan_id, day_number)
);

CREATE TABLE IF NOT EXISTS reading_plan_enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id uuid NOT NULL REFERENCES reading_plans(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  started_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(plan_id, user_id)
);
CREATE INDEX IF NOT EXISTS reading_plan_enrollments_user_idx ON reading_plan_enrollments(user_id, updated_at DESC);

CREATE TABLE IF NOT EXISTS reading_plan_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id uuid NOT NULL REFERENCES reading_plans(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  day_number integer NOT NULL CHECK (day_number > 0 AND day_number <= 365),
  completed boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(plan_id, user_id, day_number)
);
CREATE INDEX IF NOT EXISTS reading_plan_progress_user_idx ON reading_plan_progress(user_id, updated_at DESC);

CREATE TABLE IF NOT EXISTS prayers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title varchar(160) NOT NULL,
  description text,
  status varchar(20) NOT NULL DEFAULT 'ACTIVE',
  tags jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS prayers_user_updated_idx ON prayers(user_id, updated_at DESC);

CREATE TABLE IF NOT EXISTS prayer_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prayer_id uuid NOT NULL REFERENCES prayers(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS prayer_updates_prayer_idx ON prayer_updates(prayer_id, created_at DESC);
