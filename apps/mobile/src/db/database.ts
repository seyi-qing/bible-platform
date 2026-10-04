import * as SQLite from 'expo-sqlite';

export type LocalOperation = {
  operationId: string;
  deviceId: string;
  entity: 'highlight' | 'note' | 'bookmark' | 'reading_history';
  entityId: string;
  operation: 'CREATE' | 'UPDATE' | 'DELETE';
  payload: Record<string, unknown>;
  createdAt: string;
};

let databasePromise: Promise<SQLite.SQLiteDatabase> | undefined;

export function getDatabase() {
  if (!databasePromise) databasePromise = SQLite.openDatabaseAsync('bible-platform.db');
  return databasePromise;
}

export async function initializeDatabase() {
  const db = await getDatabase();
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
    CREATE TABLE IF NOT EXISTS metadata (key TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS bible_chapters (
      version_id INTEGER NOT NULL,
      book_id TEXT NOT NULL,
      chapter INTEGER NOT NULL,
      payload TEXT NOT NULL,
      cached_at TEXT NOT NULL,
      PRIMARY KEY (version_id, book_id, chapter)
    );
    CREATE TABLE IF NOT EXISTS highlights (
      id TEXT PRIMARY KEY NOT NULL,
      version_id INTEGER NOT NULL,
      reference TEXT NOT NULL,
      color TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY NOT NULL,
      version_id INTEGER,
      reference TEXT,
      title TEXT,
      body TEXT NOT NULL,
      is_private INTEGER NOT NULL DEFAULT 1,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS bookmarks (
      id TEXT PRIMARY KEY NOT NULL,
      version_id INTEGER NOT NULL,
      reference TEXT NOT NULL,
      label TEXT,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS reading_history (
      id TEXT PRIMARY KEY NOT NULL,
      version_id INTEGER NOT NULL,
      reference TEXT NOT NULL,
      progress INTEGER NOT NULL DEFAULT 0,
      last_read_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS sync_queue (
      operation_id TEXT PRIMARY KEY NOT NULL,
      device_id TEXT NOT NULL,
      entity TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      operation TEXT NOT NULL,
      payload TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);
  return db;
}

export async function enqueueOperation(operation: LocalOperation) {
  const db = await initializeDatabase();
  await db.runAsync(
    `INSERT OR IGNORE INTO sync_queue (operation_id, device_id, entity, entity_id, operation, payload, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    operation.operationId, operation.deviceId, operation.entity, operation.entityId, operation.operation, JSON.stringify(operation.payload), operation.createdAt,
  );
}

export async function listQueuedOperations(limit = 100): Promise<LocalOperation[]> {
  const db = await initializeDatabase();
  const rows = await db.getAllAsync<{ operation_id: string; device_id: string; entity: LocalOperation['entity']; entity_id: string; operation: LocalOperation['operation']; payload: string; created_at: string }>(`SELECT * FROM sync_queue ORDER BY created_at ASC LIMIT ?`, limit);
  return rows.map(row => ({ operationId: row.operation_id, deviceId: row.device_id, entity: row.entity, entityId: row.entity_id, operation: row.operation, payload: JSON.parse(row.payload), createdAt: row.created_at }));
}

export async function removeQueuedOperations(operationIds: string[]) {
  if (!operationIds.length) return;
  const db = await initializeDatabase();
  await db.withExclusiveTransactionAsync(async txn => {
    for (const id of operationIds) await txn.runAsync(`DELETE FROM sync_queue WHERE operation_id = ?`, id);
  });
}
