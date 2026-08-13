import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, VerifyCallback, Profile } from "passport-google-oauth20";
import { ConfigService } from "@nestjs/config";
import { UsersService } from "../../users/users.service";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, "google") {
  constructor(
    config: ConfigService,
    private readonly users: UsersService,
  ) {
    super({
      clientID: config.get<string>("GOOGLE_CLIENT_ID") ?? "",
      clientSecret: config.get<string>("GOOGLE_CLIENT_SECRET") ?? "",
      callbackURL: `${config.get<string>("BACKEND_API_URL") ?? "http://127.0.0.1:4001"}/api/v1/auth/google/callback`,
      scope: ["email", "profile"],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<void> {
    const email = profile.emails?.[0]?.value;
    if (!email) {
      return done(new Error("Google account has no email"), undefined);
    }

    const displayName =
      profile.displayName ??
      `${profile.name?.givenName ?? ""} ${profile.name?.familyName ?? ""}`.trim();
    const avatarUrl = profile.photos?.[0]?.value ?? null;

    // Find existing user or auto-register
    let user = await this.users.findByEmail(email);

    if (!user) {
      const userProfile = await this.users.createProfile({
        email,
        name: displayName || email.split("@")[0] || "User",
        passwordHash: "",
        authProvider: "google",
        avatarUrl,
      });
      return done(null, {
        id: userProfile.id,
        email: userProfile.email,
        role: userProfile.role,
      });
    }

    done(null, {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    });
  }
}
