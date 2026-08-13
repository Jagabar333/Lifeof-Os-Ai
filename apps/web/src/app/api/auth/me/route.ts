import { apiSuccess, apiUnauthorized } from "@/lib/api/response";
import { getCurrentUser } from "@/lib/api/with-auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return apiUnauthorized();
  }
  return apiSuccess({ user });
}
