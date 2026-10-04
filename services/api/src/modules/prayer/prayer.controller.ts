import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards } from "@nestjs/common";
import { and, desc, eq } from "drizzle-orm";
import { createDatabase, prayers, prayerUpdates } from "@bible-platform/database";
import { AuthGuard, AuthenticatedRequest } from "../../common/guards/auth.guard";
import { z } from "zod";

const prayerSchema = z.object({
  title: z.string().min(1).max(160),
  description: z.string().max(5000).optional(),
  status: z.enum(["ACTIVE", "ANSWERED", "ARCHIVED"]).default("ACTIVE"),
  tags: z.array(z.string().max(40)).max(20).default([]),
});
const updateSchema = z.object({ body: z.string().min(1).max(10000), status: z.enum(["ACTIVE", "ANSWERED", "ARCHIVED"]).optional() });

@Controller("prayers")
@UseGuards(AuthGuard)
export class PrayerController {
  private readonly database = createDatabase(process.env.DATABASE_URL ?? "");

  @Get()
  list(@Req() req: AuthenticatedRequest) {
    return this.database.db.select().from(prayers).where(eq(prayers.userId, req.user.sub)).orderBy(desc(prayers.updatedAt));
  }

  @Post()
  create(@Req() req: AuthenticatedRequest, @Body() body: unknown) {
    const input = prayerSchema.parse(body);
    return this.database.db.insert(prayers).values({ ...input, userId: req.user.sub }).returning();
  }

  @Put(":id")
  update(@Req() req: AuthenticatedRequest, @Param("id") id: string, @Body() body: unknown) {
    const input = prayerSchema.partial().parse(body);
    return this.database.db.update(prayers).set({ ...input, updatedAt: new Date() })
      .where(and(eq(prayers.id, id), eq(prayers.userId, req.user.sub))).returning();
  }

  @Delete(":id")
  remove(@Req() req: AuthenticatedRequest, @Param("id") id: string) {
    return this.database.db.delete(prayers).where(and(eq(prayers.id, id), eq(prayers.userId, req.user.sub))).returning();
  }

  @Post(":id/updates")
  addUpdate(@Req() req: AuthenticatedRequest, @Param("id") id: string, @Body() body: unknown) {
    const input = updateSchema.parse(body);
    return this.database.db.insert(prayerUpdates).values({ prayerId: id, userId: req.user.sub, body: input.body }).returning();
  }

  @Get(":id/updates")
  updates(@Req() req: AuthenticatedRequest, @Param("id") id: string) {
    return this.database.db.select().from(prayerUpdates)
      .where(and(eq(prayerUpdates.prayerId, id), eq(prayerUpdates.userId, req.user.sub)))
      .orderBy(desc(prayerUpdates.createdAt));
  }
}
