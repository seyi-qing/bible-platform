import { Body, Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { AuthGuard, AuthenticatedRequest } from "../../common/guards/auth.guard";
import { aiStudySchema } from "./dto/ai.dto";
import { AiService } from "./ai.service";

@Controller("ai")
@UseGuards(AuthGuard)
export class AiController {
  constructor(private readonly ai: AiService) {}
  @Post("study") study(@Req() req: AuthenticatedRequest, @Body() body: unknown) { return this.ai.study(req.user.sub, aiStudySchema.parse(body)); }
  @Get("jobs/:id") job(@Req() req: AuthenticatedRequest, @Param("id") id: string) { return this.ai.getJob(req.user.sub, id); }
  @Get("conversations") conversations(@Req() req: AuthenticatedRequest) { return this.ai.conversations(req.user.sub); }
  @Get("conversations/:id/messages") messages(@Req() req: AuthenticatedRequest, @Param("id") id: string) { return this.ai.messages(req.user.sub, id); }
}
