import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { mergeMap, of, throwError } from 'rxjs';
import { apiErrorFromFailureBody } from '@core/network/http-error';

export const apiFailureInterceptor: HttpInterceptorFn = (req, next) =>
  next(req).pipe(
    mergeMap((event) => {
      if (!(event instanceof HttpResponse)) {
        return of(event);
      }
      const apiError = apiErrorFromFailureBody(event.body);
      if (apiError) {
        return throwError(() => apiError);
      }
      return of(event);
    }),
  );
