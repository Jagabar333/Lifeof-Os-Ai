import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { createTaskSchema } from "@lifeos/shared";
import { apiSuccess, apiError, apiUnauthorized } from "@/lib/api/response";
import { getCurrentUser } from "@/lib/api/with-auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return apiUnauthorized();

    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;

    const { searchParams } = new URL(req.url);
    const qs = new URLSearchParams();
    if (searchParams.get("page")) qs.set("page", searchParams.get("page")!);
    if (searchParams.get("limit")) qs.set("limit", searchParams.get("limit")!);
    if (searchParams.get("sortBy")) qs.set("sortBy", searchParams.get("sortBy")!);
    if (searchParams.get("sortOrder")) qs.set("sortOrder", searchParams.get("sortOrder")!);
    if (searchParams.get("status")) qs.set("status", searchParams.get("status")!);
    if (searchParams.get("priority")) qs.set("priority", searchParams.get("priority")!);
    if (searchParams.get("search")) qs.set("search", searchParams.get("search")!);

    const backendUrl = process.env["BACKEND_API_URL"] || "http://localhost:4001";
    const res = await fetch(`${backendUrl}/api/v1/tasks?${qs.toString()}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await res.json();
    if (!res.ok) {
      return apiError({ success: false, error: { code: "DB_ERROR", message: data.message || "Failed" } });
    }

    const unwrappedData = data.data !== undefined ? data.data : data;
    return apiSuccess(unwrappedData);
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return apiUnauthorized();

    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;

    const body = await req.json();
    const input = createTaskSchema.parse(body);

    const backendUrl = process.env["BACKEND_API_URL"] || "http://localhost:4001";
    const res = await fetch(`${backendUrl}/api/v1/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(input),
    });

    const data = await res.json();
    if (!res.ok) {
      return apiError({ success: false, error: { code: "DB_ERROR", message: data.message || "Failed" } });
    }

    const unwrappedData = data.data !== undefined ? data.data : data;
    return apiSuccess(unwrappedData);
  } catch (error) {
    return apiError(error);
  }
}
