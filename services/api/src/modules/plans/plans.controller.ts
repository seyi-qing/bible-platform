import { BadRequestException, Body, Controller, Delete, ForbiddenException, Get, NotFoundException, Param, Post, Put, Req, UseGuards } from "@nestjs/common";
import { and, desc, eq } from "drizzle-orm";
import { createDatabase, readingPlans, readingPlanDays, readingPlanEnrollments, readingPlanProgress } from "@bible-platform/database";
import { AuthGuard, AuthenticatedRequest } from "../../common/guards/auth.guard";
import { z } from "zod";

const createPlanSchema = z.object({
  title: z.string().trim().min(1).max(160),
  description: z.string().max(1000).optional(),
  totalDays: z.number().int().min(1).max(365),
  visibility: z.enum(["PRIVATE", "PUBLIC", "GROUP"]).default("PRIVATE"),
});

const daySchema = z.object({
  dayNumber: z.number().int().min(1).max(365),
  title: z.string().trim().max(160).optional(),
  passages: z.array(z.object({ versionId: z.number().int().positive(), reference: z.string().trim().min(3).max(80) })).min(1).max(50),
});

const idSchema = z.string().uuid();

@Controller("plans")
@UseGuards(AuthGuard)
export class PlansController {
  private readonly database = createDatabase(process.env.DATABASE_URL ?? "");

  private parseId(id: string) {
    return idSchema.parse(id);
  }

  private async ownedPlan(userId: string, id: string) {
    const planId = this.parseId(id);
    const [plan] = await this.database.db.select().from(readingPlans)
      .where(eq(readingPlans.id, planId)).limit(1);
    if (!plan) throw new NotFoundException("Reading plan not found");
    if (plan.ownerUserId !== userId && plan.visibility === "PRIVATE") throw new ForbiddenException("You cannot access this plan");
    return plan;
  }

  @Get()
  list(@Req() req: AuthenticatedRequest) {
    return this.database.db.select().from(readingPlans)
      .where(eq(readingPlans.ownerUserId, req.user.sub))
      .orderBy(desc(readingPlans.updatedAt));
  }

  @Post()
  create(@Req() req: AuthenticatedRequest, @Body() body: unknown) {
    const input = createPlanSchema.parse(body);
    return this.database.db.insert(readingPlans).values({ ...input, ownerUserId: req.user.sub }).returning();
  }

  @Put(":id")
  async update(@Req() req: AuthenticatedRequest, @Param("id") id: string, @Body() body: unknown) {
    const planId = this.parseId(id);
    const input = createPlanSchema.partial().parse(body);
    const result = await this.database.db.update(readingPlans)
      .set({ ...input, updatedAt: new Date() })
      .where(and(eq(readingPlans.id, planId), eq(readingPlans.ownerUserId, req.user.sub)))
      .returning();
    if (!result[0]) throw new NotFoundException("Reading plan not found");
    return result;
  }

  @Delete(":id")
  async remove(@Req() req: AuthenticatedRequest, @Param("id") id: string) {
    const planId = this.parseId(id);
    const result = await this.database.db.delete(readingPlans)
      .where(and(eq(readingPlans.id, planId), eq(readingPlans.ownerUserId, req.user.sub)))
      .returning();
    if (!result[0]) throw new NotFoundException("Reading plan not found");
    return result;
  }

  @Post(":id/days")
  async addDay(@Req() req: AuthenticatedRequest, @Param("id") id: string, @Body() body: unknown) {
    const plan = await this.ownedPlan(req.user.sub, id);
    if (plan.ownerUserId !== req.user.sub) throw new ForbiddenException("Only the plan owner can edit days");
    const input = daySchema.parse(body);
    if (input.dayNumber > plan.totalDays) throw new BadRequestException("dayNumber exceeds plan totalDays");
    return this.database.db.insert(readingPlanDays).values({ planId: plan.id, ...input }).returning();
  }

  @Get(":id/days")
  async days(@Req() req: AuthenticatedRequest, @Param("id") id: string) {
    const plan = await this.ownedPlan(req.user.sub, id);
    return this.database.db.select().from(readingPlanDays).where(eq(readingPlanDays.planId, plan.id)).orderBy(readingPlanDays.dayNumber);
  }

  @Post(":id/enroll")
  async enroll(@Req() req: AuthenticatedRequest, @Param("id") id: string) {
    const plan = await this.ownedPlan(req.user.sub, id);
    if (plan.visibility === "PRIVATE" && plan.ownerUserId !== req.user.sub) throw new ForbiddenException("Private plans cannot be joined");
    return this.database.db.insert(readingPlanEnrollments)
      .values({ planId: plan.id, userId: req.user.sub })
      .onConflictDoUpdate({ target: [readingPlanEnrollments.planId, readingPlanEnrollments.userId], set: { updatedAt: new Date() } })
      .returning();
  }

  @Post(":id/progress")
  async progress(@Req() req: AuthenticatedRequest, @Param("id") id: string, @Body() body: unknown) {
    const plan = await this.ownedPlan(req.user.sub, id);
    const input = z.object({ dayNumber: z.number().int().min(1).max(365), completed: z.boolean() }).parse(body);
    if (input.dayNumber > plan.totalDays) throw new BadRequestException("dayNumber exceeds plan totalDays");
    const [enrollment] = await this.database.db.select({ id: readingPlanEnrollments.id })
      .from(readingPlanEnrollments)
      .where(and(eq(readingPlanEnrollments.planId, plan.id), eq(readingPlanEnrollments.userId, req.user.sub))).limit(1);
    if (!enrollment && plan.ownerUserId !== req.user.sub) throw new ForbiddenException("Enroll in this plan before updating progress");
    return this.database.db.insert(readingPlanProgress)
      .values({ planId: plan.id, userId: req.user.sub, dayNumber: input.dayNumber, completed: input.completed, completedAt: input.completed ? new Date() : null })
      .onConflictDoUpdate({
        target: [readingPlanProgress.planId, readingPlanProgress.userId, readingPlanProgress.dayNumber],
        set: { completed: input.completed, completedAt: input.completed ? new Date() : null, updatedAt: new Date() },
      })
      .returning();
  }
}
