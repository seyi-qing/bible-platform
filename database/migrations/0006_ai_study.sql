CREATE TABLE IF NOT EXISTS ai_conversations (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE, title varchar(200) NOT NULL, mode varchar(40) NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now());
CREATE INDEX IF NOT EXISTS ai_conversations_user_updated_idx ON ai_conversations(user_id, updated_at DESC);
CREATE TABLE IF NOT EXISTS ai_messages (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), conversation_id uuid NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE, role varchar(20) NOT NULL, content text NOT NULL, metadata jsonb, created_at timestamptz NOT NULL DEFAULT now());
CREATE INDEX IF NOT EXISTS ai_messages_conversation_created_idx ON ai_messages(conversation_id, created_at);
CREATE TABLE IF NOT EXISTS ai_citations (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), message_id uuid NOT NULL REFERENCES ai_messages(id) ON DELETE CASCADE, version_id integer NOT NULL, reference varchar(80) NOT NULL, quote varchar(600), created_at timestamptz NOT NULL DEFAULT now());
CREATE INDEX IF NOT EXISTS ai_citations_message_idx ON ai_citations(message_id);
