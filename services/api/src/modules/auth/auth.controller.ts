import { Body, Controller, Post, Req, UseGuards } from "@nestjs/common";
import { AuthGuard, AuthenticatedRequest } from "../../common/guards/auth.guard";
import { AuthService } from "./auth.service";
import { loginSchema, refreshSchema, registerSchema } from "./dto/auth.dto";

@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post("register") register(@Body() body: unknown) { return this.auth.register(registerSchema.parse(body)); }
  @Post("login") login(@Body() body: unknown) { return this.auth.login(loginSchema.parse(body)); }
  @Post("refresh") refresh(@Body() body: unknown) { return this.auth.refresh(refreshSchema.parse(body).refreshToken); }

  @UseGuards(AuthGuard)
  @Post("logout") logout(@Req() req: AuthenticatedRequest) { return this.auth.logout(req.user.sessionId); }
}
