import { Body, Controller, Delete, ForbiddenException, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { and, desc, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import {
  communityReports, createDatabase, groupComments, groupMembers, groupPosts, groups,
  notifications,
} from "@bible-platform/database";
import { AuthGuard, AuthenticatedRequest } from "../../common/guards/auth.guard";

const groupSchema = z.object({
  name: z.string().trim().min(2).max(120),
  description: z.string().max(2000).optional(),
  visibility: z.enum(["PRIVATE", "PUBLIC"]).default("PRIVATE"),
});
const postSchema = z.object({
  body: z.string().trim().min(1).max(10000),
  postType: z.enum(["DISCUSSION", "BIBLE_STUDY", "PRAYER"]).default("DISCUSSION"),
  reference: z.string().trim().max(80).optional(),
});
const commentSchema = z.object({ body: z.string().trim().min(1).max(5000) });
const reportSchema = z.object({
  reason: z.enum(["SPAM", "HARASSMENT", "HATE", "SEXUAL", "MISINFORMATION", "OTHER"]),
  details: z.string().max(2000).optional(),
});

@Controller("community")
@UseGuards(AuthGuard)
export class CommunityController {
  private readonly database = createDatabase(process.env.DATABASE_URL ?? "");

  @Get("groups")
  async listGroups(@Req() req: AuthenticatedRequest) {
    const owned = await this.database.db.select().from(groups)
      .where(eq(groups.ownerUserId, req.user.sub)).orderBy(desc(groups.updatedAt));
    const memberships = await this.database.db.select({ groupId: groupMembers.groupId })
      .from(groupMembers).where(eq(groupMembers.userId, req.user.sub));
    const memberIds = memberships.map((x) => x.groupId);
    const joined = memberIds.length
      ? await this.database.db.select().from(groups).where(inArray(groups.id, memberIds)).orderBy(desc(groups.updatedAt))
      : [];
    return [...owned, ...joined.filter((g) => !owned.some((o) => o.id === g.id))];
  }

  @Post("groups")
  async createGroup(@Req() req: AuthenticatedRequest, @Body() body: unknown) {
    const input = groupSchema.parse(body);
    return this.database.db.transaction(async (tx) => {
      const [group] = await tx.insert(groups).values({ ...input, ownerUserId: req.user.sub }).returning();
      await tx.insert(groupMembers).values({ groupId: group.id, userId: req.user.sub, role: "OWNER" });
      return group;
    });
  }

  @Get("groups/:id")
  async getGroup(@Req() req: AuthenticatedRequest, @Param("id") id: string) {
    await this.requireMember(req.user.sub, id);
    const [group] = await this.database.db.select().from(groups).where(eq(groups.id, id));
    if (!group) return null;
    const members = await this.database.db.select().from(groupMembers).where(eq(groupMembers.groupId, id));
    return { group, members };
  }

  @Post("groups/:id/join")
  async join(@Req() req: AuthenticatedRequest, @Param("id") id: string) {
    const [group] = await this.database.db.select().from(groups).where(eq(groups.id, id));
    if (!group) return { ok: false, reason: "GROUP_NOT_FOUND" };
    if (group.visibility !== "PUBLIC" && group.ownerUserId !== req.user.sub) {
      return { ok: false, reason: "PRIVATE_GROUP" };
    }
    return this.database.db.insert(groupMembers).values({ groupId: id, userId: req.user.sub })
      .onConflictDoUpdate({ target: [groupMembers.groupId, groupMembers.userId], set: { status: "ACTIVE" } }).returning();
  }

  @Delete("groups/:id/members/me")
  async leave(@Req() req: AuthenticatedRequest, @Param("id") id: string) {
    return this.database.db.delete(groupMembers)
      .where(and(eq(groupMembers.groupId, id), eq(groupMembers.userId, req.user.sub), eq(groupMembers.role, "MEMBER")))
      .returning();
  }

  @Get("groups/:id/posts")
  async listPosts(@Req() req: AuthenticatedRequest, @Param("id") id: string) {
    await this.requireMember(req.user.sub, id);
    return this.database.db.select().from(groupPosts).where(eq(groupPosts.groupId, id)).orderBy(desc(groupPosts.createdAt));
  }

  @Post("groups/:id/posts")
  async createPost(@Req() req: AuthenticatedRequest, @Param("id") id: string, @Body() body: unknown) {
    await this.requireMember(req.user.sub, id);
    const input = postSchema.parse(body);
    return this.database.db.insert(groupPosts).values({ ...input, groupId: id, authorUserId: req.user.sub }).returning();
  }

  @Get("posts/:postId/comments")
  async comments(@Req() req: AuthenticatedRequest, @Param("postId") postId: string) {
    const [post] = await this.database.db.select().from(groupPosts).where(eq(groupPosts.id, postId));
    if (!post) return [];
    await this.requireMember(req.user.sub, post.groupId);
    return this.database.db.select().from(groupComments).where(eq(groupComments.postId, postId)).orderBy(desc(groupComments.createdAt));
  }

  @Post("posts/:postId/comments")
  async comment(@Req() req: AuthenticatedRequest, @Param("postId") postId: string, @Body() body: unknown) {
    const [post] = await this.database.db.select().from(groupPosts).where(eq(groupPosts.id, postId));
    if (!post) return null;
    await this.requireMember(req.user.sub, post.groupId);
    const input = commentSchema.parse(body);
    return this.database.db.insert(groupComments).values({ ...input, postId, authorUserId: req.user.sub }).returning();
  }

  @Post("reports")
  async report(@Req() req: AuthenticatedRequest, @Body() body: unknown) {
    const input = reportSchema.parse(body);
    const target = z.object({ groupId: z.string().uuid().optional(), postId: z.string().uuid().optional(), commentId: z.string().uuid().optional() }).parse(body);
    if (!target.groupId && !target.postId && !target.commentId) return { ok: false, reason: "TARGET_REQUIRED" };
    return this.database.db.insert(communityReports).values({ ...input, ...target, reporterUserId: req.user.sub }).returning();
  }

  @Get("notifications")
  async notificationList(@Req() req: AuthenticatedRequest) {
    return this.database.db.select().from(notifications).where(eq(notifications.userId, req.user.sub)).orderBy(desc(notifications.createdAt)).limit(100);
  }

  @Post("notifications/:id/read")
  async markRead(@Req() req: AuthenticatedRequest, @Param("id") id: string) {
    return this.database.db.update(notifications).set({ readAt: new Date() })
      .where(and(eq(notifications.id, id), eq(notifications.userId, req.user.sub))).returning();
  }

  private async requireMember(userId: string, groupId: string) {
    const [membership] = await this.database.db.select().from(groupMembers)
      .where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, userId), eq(groupMembers.status, "ACTIVE")));
    if (!membership) throw new ForbiddenException("Group membership required");
    return membership;
  }
}
