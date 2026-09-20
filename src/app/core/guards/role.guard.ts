import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ROUTE_PATHS } from '../navigation/route-paths.const';
import { UserRole } from '../models/user-role';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const roles = (route.data['roles'] as UserRole[]) ?? [];

  if (authService.isAuthenticated() && authService.hasRole(roles)) {
    return true;
  }

  return router.createUrlTree([ROUTE_PATHS.dashboard]);
};
