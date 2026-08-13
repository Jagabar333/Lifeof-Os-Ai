import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { apiSuccess, apiError, apiUnauthorized } from "@/lib/api/response";
import { getCurrentUser } from "@/lib/api/with-auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return apiUnauthorized();

    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("search");
    const qs = query ? `?search=${encodeURIComponent(query)}` : "";

    const backendUrl = process.env["BACKEND_API_URL"] || "http://localhost:4001";
    const res = await fetch(`${backendUrl}/api/v1/notes${qs}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await res.json();
    if (!res.ok) {
      return apiError({ success: false, error: { code: "DB_ERROR", message: data.message || "Failed to fetch notes" } });
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

    const backendUrl = process.env["BACKEND_API_URL"] || "http://localhost:4001";
    const res = await fetch(`${backendUrl}/api/v1/notes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (!res.ok) {
      return apiError({ success: false, error: { code: "DB_ERROR", message: data.message || "Failed to create note" } });
    }

    const unwrappedData = data.data !== undefined ? data.data : data;
    return apiSuccess(unwrappedData);
  } catch (error) {
    return apiError(error);
  }
}
