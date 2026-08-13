import { NextRequest } from "next/server";
import { AppError } from "@lifeos/shared";
import { apiSuccess, apiError } from "@/lib/api/response";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const backendUrl = process.env["BACKEND_API_URL"] || "http://localhost:4001";
    const res = await fetch(`${backendUrl}/api/v1/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: body.email }),
    });

    const data = await res.json();

    if (!res.ok) {
      return apiError(new AppError(res.status, "REQUEST_FAILED", data.message || "Failed"));
    }

    return apiSuccess({ sent: true }, 200, "If an account exists, a reset link has been sent.");
  } catch (error) {
    return apiError(error);
  }
}
