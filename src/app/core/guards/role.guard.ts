import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ROUTE_PATHS } from '../navigation/route-paths.const';
import { UserRole } from '../models/user-role';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const permissions = (route.data['permissions'] as string[]) ?? [];
  const roles = (route.data['roles'] as UserRole[]) ?? [];

  if (!authService.isAuthenticated()) {
    return router.createUrlTree([ROUTE_PATHS.signIn]);
  }

  if (permissions.length && authService.hasAnyPermission(permissions)) {
    return true;
  }

  if (!permissions.length && roles.length && authService.hasRole(roles)) {
    return true;
  }

  if (!permissions.length && !roles.length) {
    return true;
  }

  if (permissions.length && !authService.user()?.permissions.length && authService.hasRole(roles)) {
    return true;
  }

  return router.createUrlTree([ROUTE_PATHS.dashboard]);
};
