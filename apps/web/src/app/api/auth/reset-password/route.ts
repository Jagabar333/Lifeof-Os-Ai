import { NextRequest } from "next/server";
import { AppError } from "@lifeos/shared";
import { apiSuccess, apiError } from "@/lib/api/response";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const backendUrl = process.env["BACKEND_API_URL"] || "http://localhost:4001";
    const res = await fetch(`${backendUrl}/api/v1/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: body.token, password: body.password }),
    });

    const data = await res.json();

    if (!res.ok) {
      return apiError(new AppError(res.status, "RESET_FAILED", data.message || "Failed"));
    }

    return apiSuccess({ reset: true }, 200, "Password reset successfully.");
  } catch (error) {
    return apiError(error);
  }
}
