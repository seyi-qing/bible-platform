import { Body, Controller, Headers, Post, UnauthorizedException, UseGuards } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";
import { AuthGuard } from "../../common/guards/auth.guard";
import { z } from "zod";

const schema = z.object({
  versionId: z.number().int().positive(),
  bookId: z.string().length(3),
  chapter: z.number().int().positive(),
  verses: z.array(z.object({ verse: z.number().int().positive(), text: z.string().min(1) })).min(1),
});

@Controller("internal/bible")
@UseGuards(AuthGuard)
export class IndexingController {
  constructor(@InjectQueue("search-index") private readonly searchQueue: Queue) {}

  @Post("index-chapter")
  async indexChapter(@Headers("x-internal-token") internalToken: string | undefined, @Body() body: unknown) {
    if (!process.env.INTERNAL_ADMIN_TOKEN || internalToken !== process.env.INTERNAL_ADMIN_TOKEN) throw new UnauthorizedException();
    const input = schema.parse(body);
    const jobId = `index:${input.versionId}:${input.bookId.toUpperCase()}:${input.chapter}`;
    const job = await this.searchQueue.add("index-chapter", { ...input, bookId: input.bookId.toUpperCase() }, { jobId });
    return { queued: true, jobId: job.id, status: "QUEUED" as const };
  }
}
