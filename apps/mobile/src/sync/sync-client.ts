import { listQueuedOperations, removeQueuedOperations, type LocalOperation } from '../db/database';

export type SyncClientConfig = { apiBaseUrl: string; accessToken: string; deviceId: string };

async function request<T>(config: SyncClientConfig, path: string, body: unknown): Promise<T> {
  const response = await fetch(`${config.apiBaseUrl}${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${config.accessToken}` },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`Sync request failed (${response.status})`);
  return response.json() as Promise<T>;
}

export async function pushQueuedOperations(config: SyncClientConfig): Promise<{ accepted: number; duplicates: number }> {
  const operations = await listQueuedOperations(100);
  if (!operations.length) return { accepted: 0, duplicates: 0 };
  const result = await request<{ accepted: number; duplicates: number }>(config, '/sync/push', { operations });
  await removeQueuedOperations(operations.map((operation: LocalOperation) => operation.operationId));
  return result;
}

export async function pullOperations(config: SyncClientConfig, cursor?: string) {
  return request<{ operations: LocalOperation[]; nextCursor: string }>(config, '/sync/pull', { cursor, limit: 250 });
}
