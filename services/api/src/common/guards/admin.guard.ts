import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common";
import { eq } from "drizzle-orm";
import { createDatabase, users } from "@bible-platform/database";
import { AuthenticatedRequest } from "./auth.guard";

@Injectable()
export const isAdminRole = (role: string): boolean => role === "ADMIN";

export class AdminGuard implements CanActivate {
  private readonly database = createDatabase(process.env.DATABASE_URL ?? "");

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if (!req.user?.sub) throw new UnauthorizedException();
    const [user] = await this.database.db.select({ role: users.role }).from(users).where(eq(users.id, req.user.sub)).limit(1);
    if (!user) throw new UnauthorizedException();
    if (!isAdminRole(user.role)) throw new ForbiddenException("Administrator access required");
    return true;
  }
}
