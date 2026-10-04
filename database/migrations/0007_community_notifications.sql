CREATE TABLE IF NOT EXISTS "groups" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "owner_user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "name" varchar(120) NOT NULL,
  "description" text,
  "visibility" varchar(20) NOT NULL DEFAULT 'PRIVATE',
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "groups_owner_idx" ON "groups" ("owner_user_id");

CREATE TABLE IF NOT EXISTS "group_members" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "group_id" uuid NOT NULL REFERENCES "groups"("id") ON DELETE CASCADE,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "role" varchar(20) NOT NULL DEFAULT 'MEMBER',
  "status" varchar(20) NOT NULL DEFAULT 'ACTIVE',
  "joined_at" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "group_members_group_user_unique" UNIQUE ("group_id", "user_id")
);
CREATE INDEX IF NOT EXISTS "group_members_user_idx" ON "group_members" ("user_id");

CREATE TABLE IF NOT EXISTS "group_posts" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "group_id" uuid NOT NULL REFERENCES "groups"("id") ON DELETE CASCADE,
  "author_user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "body" text NOT NULL,
  "post_type" varchar(30) NOT NULL DEFAULT 'DISCUSSION',
  "reference" varchar(80),
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "group_posts_group_created_idx" ON "group_posts" ("group_id", "created_at");

CREATE TABLE IF NOT EXISTS "group_comments" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "post_id" uuid NOT NULL REFERENCES "group_posts"("id") ON DELETE CASCADE,
  "author_user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "body" text NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "group_comments_post_created_idx" ON "group_comments" ("post_id", "created_at");

CREATE TABLE IF NOT EXISTS "community_reports" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "reporter_user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "group_id" uuid REFERENCES "groups"("id") ON DELETE CASCADE,
  "post_id" uuid REFERENCES "group_posts"("id") ON DELETE CASCADE,
  "comment_id" uuid REFERENCES "group_comments"("id") ON DELETE CASCADE,
  "reason" varchar(40) NOT NULL,
  "details" text,
  "status" varchar(20) NOT NULL DEFAULT 'OPEN',
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "resolved_at" timestamptz
);
CREATE INDEX IF NOT EXISTS "community_reports_status_idx" ON "community_reports" ("status", "created_at");

CREATE TABLE IF NOT EXISTS "notifications" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "type" varchar(50) NOT NULL,
  "title" varchar(160) NOT NULL,
  "body" text NOT NULL,
  "data" jsonb,
  "read_at" timestamptz,
  "created_at" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "notifications_user_created_idx" ON "notifications" ("user_id", "created_at");
