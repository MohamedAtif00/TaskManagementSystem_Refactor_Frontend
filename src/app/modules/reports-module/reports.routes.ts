import { Routes } from '@angular/router';
import { roleGuard } from '@core/guards/role.guard';
import { PermissionCodes } from '@core/models/permission-codes';
import { ADMIN_ROLES } from '@core/models/user-role';

export const REPORTS_ROUTES: Routes = [
  { path: '', redirectTo: 'project-overview', pathMatch: 'full' },
  {
    path: 'project-overview',
    canActivate: [roleGuard],
    data: { roles: ADMIN_ROLES, permissions: [PermissionCodes.Curriculum.Read] },
    loadComponent: () =>
      import('./features/project-overview-screen/presentation/project-overview.component').then(
        (m) => m.ProjectOverviewComponent,
      ),
  },
  {
    path: 'summaries',
    canActivate: [roleGuard],
    data: { roles: ADMIN_ROLES, permissions: [PermissionCodes.Tickets.Read] },
    loadComponent: () =>
      import('./features/summaries-screen/presentation/summaries.component').then((m) => m.SummariesComponent),
  },
  {
    path: 'subject-analytics/:projectId',
    canActivate: [roleGuard],
    data: { permissions: [PermissionCodes.Tickets.Read] },
    loadComponent: () =>
      import('./features/subject-analytics-screen/presentation/subject-analytics.component').then(
        (m) => m.SubjectAnalyticsComponent,
      ),
  },
  {
    path: 'sprint-analytics/:sprintId',
    canActivate: [roleGuard],
    data: { permissions: [PermissionCodes.Sprints.Read] },
    loadComponent: () =>
      import('./features/sprint-analytics-screen/presentation/sprint-analytics.component').then(
        (m) => m.SprintAnalyticsComponent,
      ),
  },
];
