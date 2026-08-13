import type { PaginatedResponse } from "@lifeos/shared";

interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

export class ApiClientError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly statusCode: number,
    public readonly details?: Record<string, string[]>,
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

const BASE_URL = process.env["NEXT_PUBLIC_APP_URL"] ?? "";

function buildUrl(path: string, params?: FetchOptions["params"]): string {
  const url = new URL(path, BASE_URL || "http://localhost:3000");
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    }
  }
  const pathname = url.pathname + url.search;
  return pathname;
}

async function request<T>(path: string, options: FetchOptions = {}, isRetry = false): Promise<T> {
  const { params, headers, ...rest } = options;
  const url = buildUrl(path, params);

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    credentials: "include",
    ...rest,
  });

  if (response.status === 401 && !isRetry && !path.includes("/auth/")) {
    try {
      // Attempt to refresh
      const refreshUrl = buildUrl("/api/auth/refresh");
      const refreshResponse = await fetch(refreshUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (refreshResponse.ok) {
        // Refresh succeeded, retry original request
        return request<T>(path, options, true);
      }
    } catch (e) {
      // Refresh failed
    }
    
    // Ensure we redirect if refresh failed and it wasn't already a login route
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  }

  const body = await response.json().catch(() => ({}));

  if (!response.ok || body.success === false) {
    const err = body.error ?? { code: "UNKNOWN", message: "Request failed" };
    throw new ApiClientError(err.code, err.message, response.status, err.details);
  }

  return (body.data !== undefined ? body.data : body) as T;
}

export const apiClient = {
  get: <T>(path: string, options?: FetchOptions) =>
    request<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, data?: unknown, options?: FetchOptions) =>
    request<T>(path, { ...options, method: "POST", body: JSON.stringify(data) }),
  patch: <T>(path: string, data?: unknown, options?: FetchOptions) =>
    request<T>(path, { ...options, method: "PATCH", body: JSON.stringify(data) }),
  put: <T>(path: string, data?: unknown, options?: FetchOptions) =>
    request<T>(path, { ...options, method: "PUT", body: JSON.stringify(data) }),
  delete: <T>(path: string, options?: FetchOptions) =>
    request<T>(path, { ...options, method: "DELETE" }),
};

export type { PaginatedResponse };
