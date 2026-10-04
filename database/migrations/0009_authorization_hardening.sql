-- v1.2 authorization hardening
ALTER TABLE users ADD COLUMN IF NOT EXISTS role varchar(30) NOT NULL DEFAULT 'USER';
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('USER', 'ADMIN', 'MODERATOR', 'SUPPORT'));
CREATE INDEX IF NOT EXISTS users_role_idx ON users(role);
