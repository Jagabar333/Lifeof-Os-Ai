import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { apiUnauthorized } from "./response";

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  type: string;
  iat: number;
  exp: number;
}

export type AuthStatus =
  | { authenticated: true; user: { id: string; email: string; role: string }; token: string }
  | { authenticated: false; reason: "NO_TOKEN" | "EXPIRED" | "INVALID" };

function decodeJwtPayload(token: string): { payload: JwtPayload | null; expired: boolean } {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return { payload: null, expired: false };
    
    // Replace base64url characters with standard base64 characters
    let base64 = parts[1]!.replace(/-/g, "+").replace(/_/g, "/");
    // Pad with '='
    while (base64.length % 4) {
      base64 += "=";
    }
    
    const payload = JSON.parse(Buffer.from(base64, "base64").toString("utf8"));
    // Check expiry
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return { payload: null, expired: true };
    }
    return { payload: payload as JwtPayload, expired: false };
  } catch {
    return { payload: null, expired: false };
  }
}

/**
 * Get detailed auth status including the reason for failure.
 * Use this in API routes that need to return specific error messages.
 */
export async function getAuthStatus(): Promise<AuthStatus> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    return { authenticated: false, reason: "NO_TOKEN" };
  }

  const { payload, expired } = decodeJwtPayload(accessToken);

  if (!payload) {
    return { authenticated: false, reason: expired ? "EXPIRED" : "INVALID" };
  }

  return {
    authenticated: true,
    user: { id: payload.sub, email: payload.email, role: payload.role },
    token: accessToken,
  };
}

/**
 * Simplified helper — returns the user object or null.
 * Used by routes that only need a quick yes/no auth check.
 */
export async function getCurrentUser() {
  const status = await getAuthStatus();
  if (!status.authenticated) return null;
  return status.user;
}

export function withAuth<TArgs = unknown>(
  handler: (
    req: NextRequest,
    ctx: { params: Promise<TArgs>; userId: string },
  ) => Promise<Response> | Response,
) {
  return async (
    req: NextRequest,
    ctx: { params: Promise<TArgs> },
  ): Promise<Response> => {
    const user = await getCurrentUser();

    if (!user) {
      return apiUnauthorized();
    }

    return handler(req, { params: ctx.params, userId: user.id });
  };
}

