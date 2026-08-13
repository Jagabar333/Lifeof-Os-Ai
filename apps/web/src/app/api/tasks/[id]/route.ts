import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { updateTaskSchema } from "@lifeos/shared";
import { apiSuccess, apiError, apiUnauthorized, apiNotFound } from "@/lib/api/response";
import { getCurrentUser } from "@/lib/api/with-auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user) return apiUnauthorized();

    const { id } = await params;
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;

    const backendUrl = process.env["BACKEND_API_URL"] || "http://localhost:4001";
    const res = await fetch(`${backendUrl}/api/v1/tasks/${id}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (res.status === 404) return apiNotFound("Task");
    const data = await res.json();
    if (!res.ok) return apiError({ success: false, error: { code: "DB_ERROR", message: data.message || "Failed" } });

    const unwrappedData = data.data !== undefined ? data.data : data;
    return apiSuccess(unwrappedData);
  } catch (error) {
    return apiError(error);
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user) return apiUnauthorized();

    const { id } = await params;
    const body = await req.json();
    const input = updateTaskSchema.parse(body);

    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;

    const backendUrl = process.env["BACKEND_API_URL"] || "http://localhost:4001";
    const res = await fetch(`${backendUrl}/api/v1/tasks/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(input),
    });

    if (res.status === 404) return apiNotFound("Task");
    const data = await res.json();
    if (!res.ok) return apiError({ success: false, error: { code: "DB_ERROR", message: data.message || "Failed" } });

    const unwrappedData = data.data !== undefined ? data.data : data;
    return apiSuccess(unwrappedData);
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user) return apiUnauthorized();

    const { id } = await params;
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;

    const backendUrl = process.env["BACKEND_API_URL"] || "http://localhost:4001";
    const res = await fetch(`${backendUrl}/api/v1/tasks/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) {
      const data = await res.json();
      return apiError({ success: false, error: { code: "DB_ERROR", message: data.message || "Failed" } });
    }

    return apiSuccess({ id }, 200, "Task deleted successfully.");
  } catch (error) {
    return apiError(error);
  }
}
