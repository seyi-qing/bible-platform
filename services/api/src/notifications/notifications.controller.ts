import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { and, desc, eq } from 'drizzle-orm';
import { createDatabase, devices, notifications } from '@bible-platform/database';
import { z } from 'zod';
import { AuthGuard, AuthenticatedRequest } from '../common/guards/auth.guard';

const registerDeviceSchema = z.object({
  deviceId: z.string().uuid().optional(),
  name: z.string().trim().min(1).max(120),
  platform: z.enum(['ios', 'android', 'web']).or(z.string().min(1).max(30)),
  pushToken: z.string().trim().min(1).max(512),
  notificationsEnabled: z.boolean().default(true),
});

@Controller('notifications')
@UseGuards(AuthGuard)
export class NotificationsController {
  private readonly database = createDatabase(process.env.DATABASE_URL ?? '');

  @Get()
  async list(@Req() req: AuthenticatedRequest) {
    const items = await this.database.db.select().from(notifications).where(eq(notifications.userId, req.user.sub)).orderBy(desc(notifications.createdAt)).limit(50);
    return { items, nextCursor: null };
  }

  @Post('devices')
  async registerDevice(@Req() req: AuthenticatedRequest, @Body() body: unknown) {
    const input = registerDeviceSchema.parse(body);
    if (input.deviceId) {
      const [existing] = await this.database.db.select({ id: devices.id }).from(devices).where(and(eq(devices.id, input.deviceId), eq(devices.userId, req.user.sub))).limit(1);
      if (existing) {
        const [updated] = await this.database.db.update(devices).set({ name: input.name, platform: input.platform, pushToken: input.pushToken, pushTokenUpdatedAt: new Date(), notificationsEnabled: input.notificationsEnabled, lastSeenAt: new Date() }).where(eq(devices.id, existing.id)).returning();
        return updated;
      }
    }
    const [created] = await this.database.db.insert(devices).values({ userId: req.user.sub, name: input.name, platform: input.platform, pushToken: input.pushToken, pushTokenUpdatedAt: new Date(), notificationsEnabled: input.notificationsEnabled }).returning();
    return created;
  }

  @Patch('devices/:id')
  async updateDevice(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Body() body: unknown) {
    const input = z.object({ notificationsEnabled: z.boolean() }).parse(body);
    const [updated] = await this.database.db.update(devices).set({ notificationsEnabled: input.notificationsEnabled, lastSeenAt: new Date() }).where(and(eq(devices.id, id), eq(devices.userId, req.user.sub))).returning();
    return updated ?? null;
  }
}
