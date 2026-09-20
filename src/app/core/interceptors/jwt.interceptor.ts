import { HttpInterceptorFn } from '@angular/common/http';

const TOKEN_KEY = 'access-token';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.includes('/auth/login') || req.url.includes('/auth/refresh-token')) {
    return next(req);
  }

  const token = localStorage.getItem(TOKEN_KEY);
  if (!token || !token.includes('.')) {
    return next(req);
  }

  return next(
    req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    }),
  );
};
