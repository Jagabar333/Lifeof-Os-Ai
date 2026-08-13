import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { signupSchema, AppError } from "@lifeos/shared";
import { apiSuccess, apiError } from "@/lib/api/response";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password } = signupSchema.parse(body);

    const backendUrl = process.env["BACKEND_API_URL"] || "http://localhost:4001";
    const res = await fetch(`${backendUrl}/api/v1/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      const errorMsg = data.error?.message || data.message || "Signup failed";
      const errorCode = data.error?.code || "SIGNUP_FAILED";
      return apiError(new AppError(res.status, errorCode, errorMsg));
    }

    const payload = data.data || data;

    const cookieStore = await cookies();
    cookieStore.set("access_token", payload.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60, // 15 minutes
      path: "/",
    });
    cookieStore.set("refresh_token", payload.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return apiSuccess(
      {
        user: payload.user,
      },
      201,
      "Account created successfully.",
    );
  } catch (error) {
    return apiError(error);
  }
}
