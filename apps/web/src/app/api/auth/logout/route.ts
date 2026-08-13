import { NextResponse } from "next/server";
import { apiSuccess, apiError } from "@/lib/api/response";

export async function POST() {
  try {
    const backendUrl = process.env["BACKEND_API_URL"] || "http://localhost:4001";
    
    // We can call backend logout if we want, but clearing cookies is the main thing
    await fetch(`${backendUrl}/api/v1/auth/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    }).catch(() => {});

    const res = NextResponse.json(apiSuccess(null, 200, "Logged out successfully"));
    res.cookies.delete("access_token");
    res.cookies.delete("refresh_token");
    return res;
  } catch (error) {
    return NextResponse.json(apiError(error));
  }
}
