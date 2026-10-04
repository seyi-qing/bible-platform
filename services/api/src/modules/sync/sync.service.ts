import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { and, eq, gt, asc } from 'drizzle-orm';
import {
  bookmarks, createDatabase, devices, highlights, notes, readingHistory, syncOperations,
} from '@bible-platform/database';
import type { SyncOperationInput } from './sync.dto';

@Injectable()
export class SyncService {
  private readonly database = createDatabase(process.env.DATABASE_URL ?? '');

  async registerDevice(userId: string, input: { id?: string; name: string; platform: string }) {
    if (input.id) {
      const existing = await this.database.db.select().from(devices).where(and(eq(devices.id, input.id), eq(devices.userId, userId))).limit(1);
      if (existing[0]) {
        const [updated] = await this.database.db.update(devices).set({ name: input.name, platform: input.platform, lastSeenAt: new Date() }).where(eq(devices.id, input.id)).returning();
        return updated;
      }
    }
    const [created] = await this.database.db.insert(devices).values({ ...(input.id ? { id: input.id } : {}), userId, name: input.name, platform: input.platform }).returning();
    return created;
  }

  private async assertDevice(userId: string, deviceId: string) {
    const row = await this.database.db.select({ id: devices.id }).from(devices).where(and(eq(devices.id, deviceId), eq(devices.userId, userId))).limit(1);
    if (!row[0]) throw new BadRequestException('Device is not registered for this account');
  }

  private async apply(userId: string, op: SyncOperationInput) {
    if (op.entity === 'highlight') {
      if (op.operation === 'DELETE') {
        await this.database.db.delete(highlights).where(and(eq(highlights.id, op.entityId), eq(highlights.userId, userId)));
        return;
      }
      const p = op.payload as { versionId?: number; reference?: string; color?: string };
      if (!p.versionId || !p.reference || !p.color) throw new BadRequestException('Invalid highlight payload');
      const [existing] = await this.database.db.select({ id: highlights.id, userId: highlights.userId }).from(highlights).where(eq(highlights.id, op.entityId)).limit(1);
      if (existing && existing.userId !== userId) throw new ConflictException('Resource belongs to another account');
      if (existing) {
        await this.database.db.update(highlights).set({ versionId: p.versionId, reference: p.reference, color: p.color }).where(and(eq(highlights.id, op.entityId), eq(highlights.userId, userId)));
      } else {
        await this.database.db.insert(highlights).values({ id: op.entityId, userId, versionId: p.versionId, reference: p.reference, color: p.color });
      }
      return;
    }

    if (op.entity === 'note') {
      if (op.operation === 'DELETE') {
        await this.database.db.delete(notes).where(and(eq(notes.id, op.entityId), eq(notes.userId, userId)));
        return;
      }
      const p = op.payload as { versionId?: number; reference?: string; title?: string; body?: string; isPrivate?: boolean; updatedAt?: string };
      if (!p.body || p.body.length > 100_000) throw new BadRequestException('Invalid note payload');
      const existing = await this.database.db.select({ id: notes.id, userId: notes.userId }).from(notes).where(eq(notes.id, op.entityId)).limit(1);
      if (existing[0] && existing[0].userId !== userId) throw new ConflictException('Resource belongs to another account');
      if (p.updatedAt && Number.isNaN(new Date(p.updatedAt).getTime())) throw new BadRequestException('Invalid note updatedAt');
      const values = { versionId: p.versionId, reference: p.reference, title: p.title, body: p.body, isPrivate: p.isPrivate ?? true, ...(p.updatedAt ? { updatedAt: new Date(p.updatedAt) } : {}) };
      if (existing[0]) {
        await this.database.db.update(notes).set(values).where(and(eq(notes.id, op.entityId), eq(notes.userId, userId)));
      } else {
        await this.database.db.insert(notes).values({ id: op.entityId, userId, ...values });
      }
      return;
    }

    if (op.entity === 'bookmark') {
      if (op.operation === 'DELETE') {
        await this.database.db.delete(bookmarks).where(and(eq(bookmarks.id, op.entityId), eq(bookmarks.userId, userId)));
        return;
      }
      const p = op.payload as { versionId?: number; reference?: string; label?: string };
      if (!p.versionId || !p.reference) throw new BadRequestException('Invalid bookmark payload');
      const [existing] = await this.database.db.select({ id: bookmarks.id, userId: bookmarks.userId }).from(bookmarks).where(eq(bookmarks.id, op.entityId)).limit(1);
      if (existing && existing.userId !== userId) throw new ConflictException('Resource belongs to another account');
      if (existing) {
        await this.database.db.update(bookmarks).set({ versionId: p.versionId, reference: p.reference, label: p.label }).where(and(eq(bookmarks.id, op.entityId), eq(bookmarks.userId, userId)));
      } else {
        await this.database.db.insert(bookmarks).values({ id: op.entityId, userId, versionId: p.versionId, reference: p.reference, label: p.label });
      }
      return;
    }

    if (op.entity === 'reading_history') {
      if (op.operation === 'DELETE') {
        await this.database.db.delete(readingHistory).where(and(eq(readingHistory.id, op.entityId), eq(readingHistory.userId, userId)));
        return;
      }
      const p = op.payload as { versionId?: number; reference?: string; progress?: number; lastReadAt?: string };
      if (!p.versionId || !p.reference) throw new BadRequestException('Invalid reading history payload');
      const [existing] = await this.database.db.select({ id: readingHistory.id, userId: readingHistory.userId }).from(readingHistory).where(eq(readingHistory.id, op.entityId)).limit(1);
      if (existing && existing.userId !== userId) throw new ConflictException('Resource belongs to another account');
      const values = { versionId: p.versionId, reference: p.reference, progress: p.progress ?? 0, ...(p.lastReadAt ? { lastReadAt: new Date(p.lastReadAt) } : {}) };
      if (existing) {
        await this.database.db.update(readingHistory).set(values).where(and(eq(readingHistory.id, op.entityId), eq(readingHistory.userId, userId)));
      } else {
        await this.database.db.insert(readingHistory).values({ id: op.entityId, userId, ...values });
      }
    }
  }

  async push(userId: string, operations: SyncOperationInput[]) {
    let accepted = 0;
    let duplicates = 0;
    for (const op of operations) {
      await this.assertDevice(userId, op.deviceId);
      const existing = await this.database.db.select({ id: syncOperations.id }).from(syncOperations).where(and(eq(syncOperations.operationId, op.operationId), eq(syncOperations.userId, userId))).limit(1);
      if (existing[0]) { duplicates++; continue; }
      await this.apply(userId, op);
      await this.database.db.insert(syncOperations).values({ operationId: op.operationId, userId, deviceId: op.deviceId, entity: op.entity, entityId: op.entityId, operation: op.operation, payload: op.payload });
      accepted++;
    }
    return { accepted, duplicates };
  }

  async pull(userId: string, cursor: string | undefined, limit: number) {
    const since = cursor ? new Date(cursor) : new Date(0);
    if (Number.isNaN(since.getTime())) throw new BadRequestException('Invalid cursor');
    const rows = await this.database.db.select().from(syncOperations).where(and(eq(syncOperations.userId, userId), gt(syncOperations.createdAt, since))).orderBy(asc(syncOperations.createdAt)).limit(limit);
    const nextCursor = rows.length ? rows[rows.length - 1].createdAt.toISOString() : cursor ?? new Date().toISOString();
    return { operations: rows.map(row => ({ operationId: row.operationId, deviceId: row.deviceId, entity: row.entity, entityId: row.entityId, operation: row.operation, payload: row.payload, createdAt: row.createdAt.toISOString() })), nextCursor };
  }
}
