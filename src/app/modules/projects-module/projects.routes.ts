import { Routes } from '@angular/router';
import { roleGuard } from '@core/guards/role.guard';
import { PermissionCodes } from '@core/models/permission-codes';
import { UserRole } from '@core/models/user-role';
import { CURRICULUM_ADMIN_DI_CONTAINER } from './features/curriculum-admin-screen/di_container';
import { PROJECT_LIST_DI_CONTAINER } from './features/project-list-screen/di_container';

export const PROJECTS_ROUTES: Routes = [
  {
    path: '',
    canActivate: [roleGuard],
    data: { roles: [UserRole.ProjectManager, UserRole.Owner], permissions: [PermissionCodes.Curriculum.Read] },
    providers: PROJECT_LIST_DI_CONTAINER,
    loadComponent: () =>
      import('./features/project-list-screen/presentation/project-list.component').then(
        (m) => m.ProjectListComponent,
      ),
  },
  {
    path: 'curriculum',
    canActivate: [roleGuard],
    data: { roles: [UserRole.ProjectManager, UserRole.Owner], permissions: [PermissionCodes.Curriculum.Read] },
    providers: CURRICULUM_ADMIN_DI_CONTAINER,
    loadComponent: () =>
      import('./features/curriculum-admin-screen/presentation/curriculum-admin.component').then(
        (m) => m.CurriculumAdminComponent,
      ),
  },
];
