import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { apiSuccess, apiError, apiUnauthorized } from "@/lib/api/response";
import { getCurrentUser } from "@/lib/api/with-auth";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) return apiUnauthorized();

    const { id } = await params;
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;

    const backendUrl = process.env["BACKEND_API_URL"] || "http://localhost:4001";
    const res = await fetch(`${backendUrl}/api/v1/finance/transactions/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (res.status === 204 || res.status === 200) {
      return new Response(null, { status: 204 });
    }

    const data = await res.json();
    if (!res.ok) {
      return apiError({ success: false, error: { code: "DB_ERROR", message: data.message || "Failed to delete transaction" } });
    }

    return apiSuccess(null);
  } catch (error) {
    return apiError(error);
  }
}
