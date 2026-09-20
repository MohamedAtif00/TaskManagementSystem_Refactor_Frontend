import { HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';

export function mapHttpError(err: unknown): Observable<never> {
  if (!(err instanceof HttpErrorResponse)) {
    return throwError(() => (err instanceof Error ? err : new Error('Request failed')));
  }

  const body = err.error;
  if (typeof body === 'string' && body.trim()) {
    return throwError(() => new Error(body));
  }
  if (body && typeof body === 'object') {
    const problem = body as { detail?: string; title?: string; code?: string };
    const message = problem.detail || problem.title || problem.code || err.message || 'Request failed';
    return throwError(() => new Error(message));
  }
  return throwError(() => new Error(err.message || 'Request failed'));
}
