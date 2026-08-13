import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { apiSuccess, apiError, apiUnauthorized } from "@/lib/api/response";
import { getCurrentUser } from "@/lib/api/with-auth";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string; milestoneId: string }> }) {
  try {
    const { id, milestoneId } = await params;
    const user = await getCurrentUser();
    if (!user) return apiUnauthorized();

    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;

    const backendUrl = process.env["BACKEND_API_URL"] || "http://localhost:4001";
    const res = await fetch(`${backendUrl}/api/v1/goals/${id}/milestones/${milestoneId}/toggle`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      }
    });

    const data = await res.json();
    if (!res.ok) return apiError({ success: false, error: { code: "DB_ERROR", message: data.message || "Failed" } });

    const unwrappedData = data.data !== undefined ? data.data : data;
    return apiSuccess(unwrappedData);
  } catch (error) {
    return apiError(error);
  }
}
