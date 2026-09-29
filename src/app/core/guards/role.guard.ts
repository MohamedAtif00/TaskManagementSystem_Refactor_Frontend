import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ROUTE_PATHS } from '../navigation/route-paths.const';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const permissions = (route.data['permissions'] as string[]) ?? [];

  if (!authService.isAuthenticated()) {
    return router.createUrlTree([ROUTE_PATHS.signIn]);
  }

  if (!permissions.length || authService.hasAnyPermission(permissions)) {
    return true;
  }

  return router.createUrlTree([ROUTE_PATHS.dashboard]);
};
