ALTER TABLE "devices" ADD COLUMN IF NOT EXISTS "push_token" varchar(512);
ALTER TABLE "devices" ADD COLUMN IF NOT EXISTS "push_token_updated_at" timestamptz;
ALTER TABLE "devices" ADD COLUMN IF NOT EXISTS "notifications_enabled" boolean NOT NULL DEFAULT true;
CREATE INDEX IF NOT EXISTS "devices_push_token_idx" ON "devices" ("push_token");

CREATE TABLE IF NOT EXISTS "ai_jobs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "conversation_id" uuid REFERENCES "ai_conversations"("id") ON DELETE SET NULL,
  "status" varchar(20) NOT NULL DEFAULT 'QUEUED',
  "input" jsonb NOT NULL,
  "result" jsonb,
  "error" text,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "started_at" timestamptz,
  "completed_at" timestamptz
);
CREATE INDEX IF NOT EXISTS "ai_jobs_user_created_idx" ON "ai_jobs" ("user_id", "created_at");
CREATE INDEX IF NOT EXISTS "ai_jobs_status_created_idx" ON "ai_jobs" ("status", "created_at");
