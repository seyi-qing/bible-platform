import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { eq, and, isNull, gt } from "drizzle-orm";
import { SignJWT } from "jose";
import { createDatabase, sessions, users } from "@bible-platform/database";
import { hashPassword, verifyPassword } from "../../common/crypto/password";
import { hashToken, newRefreshToken } from "../../common/crypto/tokens";

@Injectable()
export class AuthService {
  private readonly database = createDatabase(process.env.DATABASE_URL ?? "");

  private async accessToken(userId: string, sessionId: string): Promise<string> {
    const secret = process.env.JWT_ACCESS_SECRET;
    if (!secret) throw new Error("JWT_ACCESS_SECRET is not configured");
    return new SignJWT({ sid: sessionId, type: "access" })
      .setProtectedHeader({ alg: "HS256" })
      .setSubject(userId)
      .setIssuer(process.env.JWT_ISSUER ?? "bible-platform")
      .setIssuedAt()
      .setExpirationTime("15m")
      .sign(new TextEncoder().encode(secret));
  }

  async register(input: { email: string; password: string; displayName: string }) {
    const email = input.email.trim().toLowerCase();
    const existing = await this.database.db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
    if (existing.length) throw new ConflictException("An account already exists for this email");
    const passwordHash = await hashPassword(input.password);
    const [user] = await this.database.db.insert(users).values({ email, passwordHash, displayName: input.displayName.trim() }).returning({ id: users.id, email: users.email, displayName: users.displayName });
    if (!user) throw new Error("Failed to create account");
    return this.issueSession(user.id, user.email, user.displayName);
  }

  async login(input: { email: string; password: string; deviceId?: string }) {
    const email = input.email.trim().toLowerCase();
    const [user] = await this.database.db.select().from(users).where(eq(users.email, email)).limit(1);
    if (!user?.passwordHash || !(await verifyPassword(input.password, user.passwordHash))) throw new UnauthorizedException("Invalid email or password");
    return this.issueSession(user.id, user.email, user.displayName, input.deviceId);
  }

  private async issueSession(userId: string, email: string, displayName: string, deviceId?: string) {
    const refreshToken = newRefreshToken();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const [session] = await this.database.db.insert(sessions).values({ userId, refreshTokenHash: hashToken(refreshToken), deviceId, expiresAt }).returning({ id: sessions.id });
    if (!session) throw new Error("Failed to create session");
    return { accessToken: await this.accessToken(userId, session.id), refreshToken, user: { id: userId, email, displayName } };
  }

  async refresh(refreshToken: string) {
    const tokenHash = hashToken(refreshToken);
    const now = new Date();
    const [session] = await this.database.db.select().from(sessions).where(and(eq(sessions.refreshTokenHash, tokenHash), isNull(sessions.revokedAt), gt(sessions.expiresAt, now))).limit(1);
    if (!session) throw new UnauthorizedException("Invalid or expired refresh token");
    const nextToken = newRefreshToken();
    const nextHash = hashToken(nextToken);
    // Compare-and-swap the token hash. If two refresh requests race, only the
    // request holding the current token hash can rotate the session.
    const [updated] = await this.database.db.update(sessions)
      .set({ refreshTokenHash: nextHash, lastUsedAt: now })
      .where(and(eq(sessions.id, session.id), eq(sessions.refreshTokenHash, tokenHash), isNull(sessions.revokedAt), gt(sessions.expiresAt, now)))
      .returning({ id: sessions.id });
    if (!updated) throw new UnauthorizedException("Refresh token already rotated or revoked");
    const [user] = await this.database.db.select({ id: users.id, email: users.email, displayName: users.displayName }).from(users).where(eq(users.id, session.userId)).limit(1);
    if (!user) throw new UnauthorizedException();
    return { accessToken: await this.accessToken(user.id, session.id), refreshToken: nextToken, user };
  }

  async logout(sessionId: string) {
    await this.database.db.update(sessions).set({ revokedAt: new Date() }).where(eq(sessions.id, sessionId));
    return { success: true };
  }
}
