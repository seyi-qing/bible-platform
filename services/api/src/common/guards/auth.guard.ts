import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { jwtVerify } from "jose";
import type { Request } from "express";

export interface AuthenticatedRequest extends Request { user: { sub: string; sessionId: string } }

@Injectable()
export class AuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) throw new UnauthorizedException();
    const token = header.slice(7);
    const secret = process.env.JWT_ACCESS_SECRET;
    if (!secret) throw new Error("JWT_ACCESS_SECRET is not configured");
    try {
      const { payload } = await jwtVerify(token, new TextEncoder().encode(secret), { issuer: process.env.JWT_ISSUER ?? "bible-platform" });
      if (typeof payload.sub !== "string" || typeof payload.sid !== "string") throw new Error("Invalid token claims");
      req.user = { sub: payload.sub, sessionId: payload.sid };
      return true;
    } catch { throw new UnauthorizedException("Invalid or expired access token"); }
  }
}
