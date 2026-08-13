import { NextResponse } from "next/server";
import { AppError, getErrorStatusCode, getErrorMessage } from "@lifeos/shared";
import { ZodError } from "zod";

type ApiSuccessData<T> = {
  success: true;
  data: T;
  message?: string;
};

type ApiErrorData = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
};

export function apiSuccess<T>(data: T, status = 200, message?: string) {
  const body: ApiSuccessData<T> = { success: true, data, message };
  return NextResponse.json(body, { status });
}

export function apiError(error: unknown, fallbackStatus = 500) {
  console.error("[API Error]", error);

  if (error instanceof AppError) {
    const body: ApiErrorData = {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
    };
    return NextResponse.json(body, { status: error.statusCode });
  }

  if (error instanceof ZodError) {
    const details: Record<string, string[]> = {};
    for (const issue of error.issues) {
      const key = issue.path.join(".");
      details[key] = details[key] ?? [];
      details[key].push(issue.message);
    }
    const body: ApiErrorData = {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Request validation failed",
        details,
      },
    };
    return NextResponse.json(body, { status: 422 });
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "success" in error &&
    "error" in error &&
    typeof (error as any).error === "object"
  ) {
    const errorObj = (error as any).error;
    const body: ApiErrorData = {
      success: false,
      error: {
        code: errorObj.code || "INTERNAL_ERROR",
        message: errorObj.message || "An unexpected error occurred",
        details: errorObj.details,
      },
    };
    return NextResponse.json(body, { status: fallbackStatus === 500 ? 400 : fallbackStatus });
  }

  const body: ApiErrorData = {
    success: false,
    error: {
      code: "INTERNAL_ERROR",
      message: getErrorMessage(error),
    },
  };
  return NextResponse.json(body, { status: getErrorStatusCode(error) || fallbackStatus });
}

export function apiNotFound(resource = "Resource") {
  return apiError(new AppError(404, "NOT_FOUND", `${resource} not found`));
}

export function apiUnauthorized(message = "Authentication required") {
  return apiError(new AppError(401, "UNAUTHORIZED", message));
}

export function apiForbidden(message = "You do not have permission to perform this action") {
  return apiError(new AppError(403, "FORBIDDEN", message));
}
