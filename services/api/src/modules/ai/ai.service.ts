import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";
import { and, desc, eq } from "drizzle-orm";
import { createDatabase, aiConversations, aiJobs, aiMessages } from "@bible-platform/database";
import type { AiAnswer } from "./ai.types";
import type { AiStudyInput } from "./dto/ai.dto";

@Injectable()
export class AiService {
  private readonly database = createDatabase(process.env.DATABASE_URL ?? "");

  constructor(@InjectQueue("ai") private readonly aiQueue: Queue) {}

  async study(userId: string, input: AiStudyInput) {
    if (input.conversationId) {
      const [conversation] = await this.database.db.select({ id: aiConversations.id }).from(aiConversations).where(and(eq(aiConversations.id, input.conversationId), eq(aiConversations.userId, userId))).limit(1);
      if (!conversation) throw new NotFoundException("AI conversation not found");
    }
    const [job] = await this.database.db.insert(aiJobs).values({ userId, conversationId: input.conversationId ?? null, input }).returning({ id: aiJobs.id });
    if (!job) throw new BadRequestException("Unable to create AI study job");
    await this.aiQueue.add("study", { jobId: job.id, userId, input }, { jobId: job.id });
    return { jobId: job.id, status: "QUEUED" as const };
  }

  async getJob(userId: string, jobId: string) {
    const [job] = await this.database.db.select().from(aiJobs).where(and(eq(aiJobs.id, jobId), eq(aiJobs.userId, userId))).limit(1);
    if (!job) throw new NotFoundException("AI job not found");
    return job;
  }

  async conversations(userId: string) {
    return this.database.db.select().from(aiConversations).where(eq(aiConversations.userId, userId)).orderBy(desc(aiConversations.updatedAt));
  }

  async messages(userId: string, id: string) {
    const [conversation] = await this.database.db.select({ id: aiConversations.id }).from(aiConversations).where(and(eq(aiConversations.id, id), eq(aiConversations.userId, userId))).limit(1);
    if (!conversation) return [];
    return this.database.db.select().from(aiMessages).where(eq(aiMessages.conversationId, id)).orderBy(aiMessages.createdAt);
  }
}
