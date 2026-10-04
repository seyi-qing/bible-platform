import { z } from 'zod';

export const syncOperationSchema = z.object({
  operationId: z.string().min(8).max(120),
  deviceId: z.string().uuid(),
  entity: z.enum(['highlight', 'note', 'bookmark', 'reading_history']),
  entityId: z.string().uuid(),
  operation: z.enum(['CREATE', 'UPDATE', 'DELETE']),
  payload: z.record(z.string(), z.unknown()).default({}),
  createdAt: z.string().datetime().optional(),
});

export const pushSyncSchema = z.object({ operations: z.array(syncOperationSchema).max(250) });
export const pullSyncSchema = z.object({
  cursor: z.string().datetime().optional(),
  limit: z.coerce.number().int().min(1).max(500).default(250),
});
export type SyncOperationInput = z.infer<typeof syncOperationSchema>;
