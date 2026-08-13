import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { apiSuccess, apiError } from "@/lib/api/response";
import { AppError } from "@lifeos/shared";

export async function POST(_req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refresh_token")?.value;

    if (!refreshToken) {
      return apiError(new AppError(401, "NO_TOKEN", "No refresh token available"));
    }

    const backendUrl = process.env["BACKEND_API_URL"] || "http://localhost:4001";
    const res = await fetch(`${backendUrl}/api/v1/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    const data = await res.json();

    if (!res.ok) {
      const errorMsg = data.error?.message || data.message || "Failed to refresh token";
      const errorCode = data.error?.code || "REFRESH_FAILED";
      // Clear cookies on failed refresh
      cookieStore.delete("access_token");
      cookieStore.delete("refresh_token");
      return apiError(new AppError(res.status, errorCode, errorMsg));
    }

    const payload = data.data || data;

    // Set new cookies
    cookieStore.set("access_token", payload.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60, // 15 minutes
      path: "/",
    });
    
    // Optionally update refresh token if a new one is returned
    if (payload.refreshToken) {
      cookieStore.set("refresh_token", payload.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: "/",
      });
    }

    return apiSuccess({ success: true });
  } catch (error) {
    return apiError(error);
  }
}
