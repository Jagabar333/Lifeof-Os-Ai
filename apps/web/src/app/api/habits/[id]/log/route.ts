import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { apiSuccess, apiError, apiUnauthorized } from "@/lib/api/response";
import { getCurrentUser } from "@/lib/api/with-auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) return apiUnauthorized();

    const { id } = await params;
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;

    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    
    if (!startDate || !endDate) {
      return apiError({ success: false, error: { code: "VALIDATION_ERROR", message: "startDate and endDate are required" } }, 400);
    }

    const backendUrl = process.env["BACKEND_API_URL"] || "http://localhost:4001";
    const res = await fetch(`${backendUrl}/api/v1/habits/${id}/logs?startDate=${startDate}&endDate=${endDate}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await res.json();
    if (!res.ok) {
      return apiError({ success: false, error: { code: "DB_ERROR", message: data.message || "Failed to fetch logs" } });
    }

    const unwrappedData = data.data !== undefined ? data.data : data;
    return apiSuccess(unwrappedData);
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) return apiUnauthorized();

    const { id } = await params;
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;

    const body = await req.json();

    const backendUrl = process.env["BACKEND_API_URL"] || "http://localhost:4001";
    const res = await fetch(`${backendUrl}/api/v1/habits/${id}/log`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (!res.ok) {
      return apiError({ success: false, error: { code: "DB_ERROR", message: data.message || "Failed to log habit" } });
    }

    const unwrappedData = data.data !== undefined ? data.data : data;
    return apiSuccess(unwrappedData);
  } catch (error) {
    return apiError(error);
  }
}
