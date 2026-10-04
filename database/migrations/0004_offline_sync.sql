-- v0.5 offline sync support. The core device/sync tables exist in the initial schema;
-- this migration adds operational indexes for pull queries and device recency.
CREATE INDEX IF NOT EXISTS sync_operations_user_created_idx ON sync_operations(user_id, created_at);
CREATE INDEX IF NOT EXISTS sync_operations_device_created_idx ON sync_operations(device_id, created_at);
CREATE INDEX IF NOT EXISTS devices_user_last_seen_idx ON devices(user_id, last_seen_at);
