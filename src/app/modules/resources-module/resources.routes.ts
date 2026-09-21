import { Routes } from '@angular/router';
import { roleGuard } from '@core/guards/role.guard';
import { PermissionCodes } from '@core/models/permission-codes';
import { UserRole } from '@core/models/user-role';
import { USER_LIST_DI_CONTAINER } from './features/user-list-screen/di_container';
import { ROLE_LIST_DI_CONTAINER } from './features/role-list-screen/di_container';
import { TEAM_LIST_DI_CONTAINER } from './features/team-list-screen/di_container';
import { SECTION_LIST_DI_CONTAINER } from './features/section-list-screen/di_container';

const ADMIN_ROLES = [UserRole.ProjectManager, UserRole.Owner];

export const RESOURCES_ROUTES: Routes = [
  { path: '', redirectTo: 'users', pathMatch: 'full' },
  {
    path: 'users',
    canActivate: [roleGuard],
    data: { roles: ADMIN_ROLES, permissions: [PermissionCodes.IdentityUsers.Read] },
    providers: USER_LIST_DI_CONTAINER,
    loadComponent: () =>
      import('./features/user-list-screen/presentation/user-list.component').then((m) => m.UserListComponent),
  },
  {
    path: 'roles',
    canActivate: [roleGuard],
    data: { roles: ADMIN_ROLES, permissions: [PermissionCodes.IdentityRoles.Read] },
    providers: ROLE_LIST_DI_CONTAINER,
    loadComponent: () =>
      import('./features/role-list-screen/presentation/role-list.component').then((m) => m.RoleListComponent),
  },
  {
    path: 'teams',
    canActivate: [roleGuard],
    data: { roles: ADMIN_ROLES, permissions: [PermissionCodes.Organization.Read] },
    providers: TEAM_LIST_DI_CONTAINER,
    loadComponent: () =>
      import('./features/team-list-screen/presentation/team-list.component').then((m) => m.TeamListComponent),
  },
  {
    path: 'sections',
    canActivate: [roleGuard],
    data: { roles: ADMIN_ROLES, permissions: [PermissionCodes.Organization.Read] },
    providers: SECTION_LIST_DI_CONTAINER,
    loadComponent: () =>
      import('./features/section-list-screen/presentation/section-list.component').then((m) => m.SectionListComponent),
  },
];
