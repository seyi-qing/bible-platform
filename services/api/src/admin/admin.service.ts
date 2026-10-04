import { Injectable, NotFoundException } from '@nestjs/common';
import { desc, eq, sql } from 'drizzle-orm';
import { auditLogs, communityReports, notifications, users, createDatabase } from '@bible-platform/database';

@Injectable()
export class AdminService {
  private readonly database = createDatabase(process.env.DATABASE_URL ?? '');

  async overview() {
    const [userCount] = await this.database.db.select({ count: sql<number>`count(*)` }).from(users);
    const [openReports] = await this.database.db.select({ count: sql<number>`count(*)` }).from(communityReports).where(eq(communityReports.status, 'OPEN'));
    const [unreadNotifications] = await this.database.db.select({ count: sql<number>`count(*)` }).from(notifications).where(sql`${notifications.readAt} is null`);
    return { users: Number(userCount?.count ?? 0), openReports: Number(openReports?.count ?? 0), unreadNotifications: Number(unreadNotifications?.count ?? 0) };
  }

  async listUsers(limit = 50) {
    return this.database.db.select({ id: users.id, email: users.email, displayName: users.displayName, role: users.role, emailVerifiedAt: users.emailVerifiedAt, createdAt: users.createdAt }).from(users).orderBy(desc(users.createdAt)).limit(Math.min(Math.max(limit, 1), 100));
  }

  async setUserRole(userId: string, role: string, actorUserId: string) {
    const allowed = new Set(['USER', 'MODERATOR', 'SUPPORT', 'ADMIN']);
    if (!allowed.has(role)) throw new NotFoundException('Unsupported role');
    const [user] = await this.database.db.update(users).set({ role, updatedAt: new Date() }).where(eq(users.id, userId)).returning({ id: users.id, role: users.role });
    if (!user) throw new NotFoundException('User not found');
    await this.database.db.insert(auditLogs).values({ actorUserId, action: 'USER_ROLE_CHANGED', resourceType: 'user', resourceId: userId, metadata: { role } });
    return user;
  }

  async reports(status?: string) {
    const base = this.database.db.select().from(communityReports).orderBy(desc(communityReports.createdAt)).limit(100);
    return status ? base.where(eq(communityReports.status, status)) : base;
  }

  async resolveReport(reportId: string, actorUserId: string, status: 'RESOLVED' | 'DISMISSED') {
    const [report] = await this.database.db.update(communityReports).set({ status, resolvedAt: new Date() }).where(eq(communityReports.id, reportId)).returning();
    if (!report) throw new NotFoundException('Report not found');
    await this.database.db.insert(auditLogs).values({ actorUserId, action: `REPORT_${status}`, resourceType: 'community_report', resourceId: reportId });
    return report;
  }

  async audit(limit = 100) {
    return this.database.db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(Math.min(Math.max(limit, 1), 200));
  }
}
