import { Body, Controller, Get, Req, UseGuards } from "@nestjs/common";
import { and, desc, eq } from "drizzle-orm";
import { createDatabase, readingHistory } from "@bible-platform/database";
import { AuthGuard, AuthenticatedRequest } from "../../common/guards/auth.guard";
import { z } from "zod";

const historySchema = z.object({ versionId: z.number().int().positive(), reference: z.string().min(3).max(80), progress: z.number().int().min(0).max(100).default(0) });

@Controller("history")
@UseGuards(AuthGuard)
export class HistoryController {
  private readonly database = createDatabase(process.env.DATABASE_URL ?? "");

  @Get()
  list(@Req() req: AuthenticatedRequest) {
    return this.database.db.select().from(readingHistory).where(eq(readingHistory.userId, req.user.sub)).orderBy(desc(readingHistory.lastReadAt)).limit(100);
  }

  @Post()
  upsert(@Req() req: AuthenticatedRequest, @Body() body: unknown) {
    const input = historySchema.parse(body);
    return this.database.db.insert(readingHistory)
      .values({ ...input, userId: req.user.sub, lastReadAt: new Date() })
      .onConflictDoUpdate({
        target: [readingHistory.userId, readingHistory.versionId, readingHistory.reference],
        set: { progress: input.progress, lastReadAt: new Date() },
      })
      .returning();
  }
}
