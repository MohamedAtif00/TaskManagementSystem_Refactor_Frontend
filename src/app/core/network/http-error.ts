import { HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';

export class ApiError extends Error {
  constructor(
    message: string,
    readonly code?: string,
    readonly fieldErrors?: Record<string, string[]>,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function apiErrorFromFailureBody(body: unknown): ApiError | null {
  if (!body || typeof body !== 'object') {
    return null;
  }
  const failure = body as {
    success?: boolean;
    message?: string;
    code?: string;
    errors?: Record<string, string[] | string>;
  };
  if (failure.success !== false || !failure.message?.trim()) {
    return null;
  }
  const fieldErrors = normalizeFieldErrors(failure.errors);
  const fieldMessage = fieldErrors
    ? Object.entries(fieldErrors)
        .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
        .join('; ')
    : '';
  const message = fieldMessage || failure.message;
  return new ApiError(message, failure.code, fieldErrors);
}

export function mapHttpError(err: unknown): Observable<never> {
  if (err instanceof ApiError) {
    return throwError(() => err);
  }
  if (!(err instanceof HttpErrorResponse)) {
    return throwError(() => (err instanceof Error ? err : new Error('Request failed')));
  }

  const body = err.error;
  const okFailure = apiErrorFromFailureBody(body);
  if (okFailure) {
    return throwError(() => okFailure);
  }
  if (typeof body === 'string' && body.trim()) {
    return throwError(() => new ApiError(body));
  }
  if (body && typeof body === 'object') {
    const problem = body as {
      detail?: string;
      title?: string;
      code?: string;
      errors?: Record<string, string[] | string>;
    };
    const fieldErrors = normalizeFieldErrors(problem.errors);
    const fieldMessage = fieldErrors
      ? Object.entries(fieldErrors)
          .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
          .join('; ')
      : '';
    const message =
      fieldMessage || problem.detail || problem.title || problem.code || err.message || 'Request failed';
    return throwError(() => new ApiError(message, problem.code, fieldErrors));
  }
  return throwError(() => new ApiError(err.message || 'Request failed'));
}

function normalizeFieldErrors(
  errors?: Record<string, string[] | string>,
): Record<string, string[]> | undefined {
  if (!errors) {
    return undefined;
  }
  const mapped: Record<string, string[]> = {};
  for (const [field, value] of Object.entries(errors)) {
    mapped[field] = Array.isArray(value) ? value : [value];
  }
  return mapped;
}
