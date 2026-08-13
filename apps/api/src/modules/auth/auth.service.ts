import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import * as bcrypt from "bcrypt";
import { UsersService } from "../users/users.service";

@Injectable()
export class AuthService {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly users: UsersService,
  ) {}

  async signUp(email: string, password: string, name: string) {
    const existingUser = await this.users.findByEmail(email);
    if (existingUser) {
      throw new ConflictException("An account with this email already exists");
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const userProfile = await this.users.createProfile({
      email,
      name,
      passwordHash,
    });

    return this.issueTokens({
      id: userProfile.id,
      email: userProfile.email,
      role: userProfile.role,
    });
  }

  async signIn(email: string, password: string) {
    const user = await this.users.findByEmail(email);
    
    if (!user) {
      throw new UnauthorizedException("Invalid email or password");
    }

    if (!user.passwordHash) {
      throw new UnauthorizedException(
        "This account uses Google login. Please sign in with Google.",
      );
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    
    if (!isMatch) {
      throw new UnauthorizedException("Invalid email or password");
    }

    return this.issueTokens({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    });
  }

  async googleSignIn(googleUser: { email: string; name: string; avatarUrl: string | null }) {
    const userProfile = await this.users.findOrCreateGoogleUser(googleUser);
    return this.issueTokens({
      id: userProfile.id,
      email: userProfile.email,
      role: userProfile.role,
    });
  }

  async refresh(token: string) {
    try {
      const payload = this.jwt.verify<{ sub: string; email: string; role: string; type: string }>(token, {
        secret: this.config.get<string>("JWT_SECRET") ?? "dev-secret-change-me",
      });
      
      if (payload.type !== "refresh") {
        throw new Error("Invalid token type");
      }

      return this.issueTokens({
        id: payload.sub,
        email: payload.email,
        role: payload.role,
      });
    } catch {
      throw new UnauthorizedException("Invalid refresh token");
    }
  }

  async forgotPassword(email: string) {
    const user = await this.users.findByEmail(email);
    if (user) {
      // In a real app, generate a reset token and send an email
      // For this migration, we simulate it
      const resetToken = this.jwt.sign(
        { sub: user._id.toString(), type: "reset" },
        { expiresIn: "15m", secret: this.config.get<string>("JWT_SECRET") ?? "dev-secret-change-me" }
      );
      console.log(`[DEV] Password reset link for ${email}: ${this.config.get<string>("NEXT_PUBLIC_APP_URL")}/reset-password?token=${resetToken}`);
    }
    return { sent: true };
  }

  async resetPassword(token: string, password: string) {
    try {
      const payload = this.jwt.verify<{ sub: string; type: string }>(token, {
        secret: this.config.get<string>("JWT_SECRET") ?? "dev-secret-change-me",
      });
      
      if (payload.type !== "reset") {
        throw new Error("Invalid token type");
      }

      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      await this.users.updatePassword(payload.sub, passwordHash);

      return { reset: true };
    } catch (error) {
      throw new UnauthorizedException("Invalid or expired reset token");
    }
  }

  /** Public method for OAuth flows (called from the controller). */
  issueTokensForOAuth(payload: { id: string; email: string; role: string }) {
    return this.issueTokens(payload);
  }

  private issueTokens(payload: { id: string; email: string; role: string }) {
    const accessToken = this.jwt.sign(
      { sub: payload.id, email: payload.email, role: payload.role, type: "access" },
      { expiresIn: "15m" },
    );
    const refreshToken = this.jwt.sign(
      { sub: payload.id, email: payload.email, role: payload.role, type: "refresh" },
      { expiresIn: "7d" },
    );
    return { accessToken, refreshToken, user: payload };
  }
}
