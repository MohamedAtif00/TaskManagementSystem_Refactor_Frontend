import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { ROUTE_PATHS } from '@core/navigation/route-paths.const';
import { AuthService, TOKEN_KEY } from '@core/services/auth.service';

export const authRefreshInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (req.url.includes('/auth/login') || req.url.includes('/auth/refresh-token')) {
    return next(req);
  }

  return next(req).pipe(
    catchError((err: unknown) => {
      if (!(err instanceof HttpErrorResponse) || err.status !== 401) {
        return throwError(() => err);
      }

      return auth.refreshAccessToken().pipe(
        switchMap((token) => {
          localStorage.setItem(TOKEN_KEY, token);
          return next(
            req.clone({
              setHeaders: {
                Authorization: `Bearer ${token}`,
              },
            }),
          );
        }),
        catchError((refreshErr) => {
          auth.logout();
          void router.navigate([ROUTE_PATHS.signIn]);
          return throwError(() => refreshErr);
        }),
      );
    }),
  );
};
