import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { readFileSync } from "node:fs";

const pools = new Map<string, ReturnType<typeof createPool>>();

function createPool(connectionString: string) {
  return new Pool({ connectionString, max: 10, idleTimeoutMillis: 30_000 });
}

function resolveConnectionString(connectionString: string): string {
  const passwordFile = process.env.DATABASE_PASSWORD_FILE;
  if (!passwordFile) return connectionString;
  const password = readFileSync(passwordFile, "utf8").trim();
  if (!password) throw new Error("DATABASE_PASSWORD_FILE is empty");
  const url = new URL(connectionString);
  url.password = password;
  return url.toString();
}

export function createDatabase(connectionString: string) {
  if (!connectionString) throw new Error("DATABASE_URL is required");
  const resolved = resolveConnectionString(connectionString);
  let pool = pools.get(resolved);
  if (!pool) {
    pool = createPool(resolved);
    pools.set(resolved, pool);
  }
  return { db: drizzle(pool), pool };
}

/** Used by tests and graceful process shutdown to close shared PostgreSQL pools. */
export async function closeDatabases() {
  await Promise.all([...pools.values()].map((pool) => pool.end()));
  pools.clear();
}
