export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
    public readonly details?: Record<string, string[]>,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    super(404, "NOT_FOUND", `${resource}${id ? ` with id "${id}"` : ""} not found`);
    this.name = "NotFoundError";
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(401, "UNAUTHORIZED", message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "You do not have permission to perform this action") {
    super(403, "FORBIDDEN", message);
    this.name = "ForbiddenError";
  }
}

export class ValidationError extends AppError {
  constructor(details: Record<string, string[]>) {
    super(422, "VALIDATION_ERROR", "Validation failed", details);
    this.name = "ValidationError";
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(409, "CONFLICT", message);
    this.name = "ConflictError";
  }
}

export class RateLimitError extends AppError {
  constructor() {
    super(429, "RATE_LIMITED", "Too many requests. Please try again later.");
    this.name = "RateLimitError";
  }
}

export class InternalError extends AppError {
  constructor(message = "An internal error occurred") {
    super(500, "INTERNAL_ERROR", message);
    this.name = "InternalError";
  }
}

export function getErrorStatusCode(error: unknown): number {
  if (error instanceof AppError) return error.statusCode;
  return 500;
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "An unexpected error occurred";
}
