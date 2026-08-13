import { Body, Controller, Get, Post, Req, Res, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";
import { ConfigService } from "@nestjs/config";
import type { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { Public } from "../../common/decorators/public.decorator";
import {
  LoginDto,
  SignupDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  RefreshTokenDto,
} from "./dto";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly config: ConfigService,
  ) {}

  @Public()
  @Post("signup")
  @Throttle({ auth: { ttl: 60_000, limit: 5 } })
  @ApiOperation({ summary: "Create a new account" })
  signup(@Body() dto: SignupDto) {
    return this.auth.signUp(dto.email, dto.password, dto.name);
  }

  @Public()
  @Post("login")
  @Throttle({ auth: { ttl: 60_000, limit: 5 } })
  @ApiOperation({ summary: "Sign in with email and password" })
  login(@Body() dto: LoginDto) {
    return this.auth.signIn(dto.email, dto.password);
  }

  @Public()
  @Post("refresh")
  @ApiOperation({ summary: "Refresh access token" })
  refresh(@Body() dto: RefreshTokenDto) {
    return this.auth.refresh(dto.refreshToken);
  }

  @Public()
  @Post("forgot-password")
  @Throttle({ auth: { ttl: 60_000, limit: 3 } })
  @ApiOperation({ summary: "Request a password reset link" })
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.auth.forgotPassword(dto.email);
  }

  @Public()
  @Post("reset-password")
  @ApiOperation({ summary: "Reset password with token" })
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.auth.resetPassword(dto.token, dto.password);
  }

  @Post("logout")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Sign out (client discards tokens)" })
  logout() {
    return { loggedOut: true };
  }

  // ── Google OAuth ─────────────────────────────────

  @Public()
  @Get("google")
  @UseGuards(AuthGuard("google"))
  @ApiOperation({ summary: "Initiate Google OAuth login" })
  googleLogin() {
    // Guard redirects to Google
  }

  @Public()
  @Get("google/callback")
  @UseGuards(AuthGuard("google"))
  @ApiOperation({ summary: "Google OAuth callback" })
  async googleCallback(@Req() req: Request, @Res() res: Response) {
    const user = req.user as { id: string; email: string; role: string };
    const tokens = this.auth.issueTokensForOAuth(user);
    const frontendUrl =
      this.config.get<string>("NEXT_PUBLIC_APP_URL") ?? "http://localhost:3002";

    // Redirect to the Next.js OAuth callback route with tokens as query params
    const callbackUrl = new URL("/api/auth/oauth-callback", frontendUrl);
    callbackUrl.searchParams.set("accessToken", tokens.accessToken);
    callbackUrl.searchParams.set("refreshToken", tokens.refreshToken);

    res.redirect(callbackUrl.toString());
  }
}
