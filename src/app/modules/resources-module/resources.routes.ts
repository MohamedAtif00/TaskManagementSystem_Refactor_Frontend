import { Routes } from '@angular/router';
import { roleGuard } from '@core/guards/role.guard';
import { UserRole } from '@core/models/user-role';
import { USER_LIST_DI_CONTAINER } from './features/user-list-screen/di_container';
import { ROLE_LIST_DI_CONTAINER } from './features/role-list-screen/di_container';
import { TEAM_LIST_DI_CONTAINER } from './features/team-list-screen/di_container';
import { SECTION_LIST_DI_CONTAINER } from './features/section-list-screen/di_container';

const ADMIN_DATA = { roles: [UserRole.ProjectManager, UserRole.Owner] };

export const RESOURCES_ROUTES: Routes = [
  { path: '', redirectTo: 'users', pathMatch: 'full' },
  {
    path: 'users',
    canActivate: [roleGuard],
    data: ADMIN_DATA,
    providers: USER_LIST_DI_CONTAINER,
    loadComponent: () =>
      import('./features/user-list-screen/presentation/user-list.component').then((m) => m.UserListComponent),
  },
  {
    path: 'roles',
    canActivate: [roleGuard],
    data: ADMIN_DATA,
    providers: ROLE_LIST_DI_CONTAINER,
    loadComponent: () =>
      import('./features/role-list-screen/presentation/role-list.component').then((m) => m.RoleListComponent),
  },
  {
    path: 'teams',
    canActivate: [roleGuard],
    data: ADMIN_DATA,
    providers: TEAM_LIST_DI_CONTAINER,
    loadComponent: () =>
      import('./features/team-list-screen/presentation/team-list.component').then((m) => m.TeamListComponent),
  },
  {
    path: 'sections',
    canActivate: [roleGuard],
    data: ADMIN_DATA,
    providers: SECTION_LIST_DI_CONTAINER,
    loadComponent: () =>
      import('./features/section-list-screen/presentation/section-list.component').then((m) => m.SectionListComponent),
  },
];
