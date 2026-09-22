import { Routes } from '@angular/router';
import { authGuard, guestGuard } from '@core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./shared/features/layout/layout.component').then((m) => m.LayoutComponent),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./modules/dashboard-module/dashboard.routes').then((m) => m.DASHBOARD_ROUTES),
      },
      {
        path: 'projects',
        loadChildren: () =>
          import('./modules/projects-module/projects.routes').then((m) => m.PROJECTS_ROUTES),
      },
      {
        path: 'tasks',
        loadChildren: () =>
          import('./modules/tasks-module/tasks.routes').then((m) => m.TASKS_ROUTES),
      },
      {
        path: 'sprints',
        loadChildren: () =>
          import('./modules/sprints-module/sprints.routes').then((m) => m.SPRINTS_ROUTES),
      },
      {
        path: 'leaves',
        loadChildren: () =>
          import('./modules/leaves-module/leaves.routes').then((m) => m.LEAVES_ROUTES),
      },
      {
        path: 'notifications',
        loadChildren: () =>
          import('./modules/notifications-module/notifications.routes').then((m) => m.NOTIFICATIONS_ROUTES),
      },
      {
        path: 'resources',
        loadChildren: () =>
          import('./modules/resources-module/resources.routes').then((m) => m.RESOURCES_ROUTES),
      },
      {
        path: 'workflows',
        loadChildren: () =>
          import('./modules/workflows-module/workflows.routes').then((m) => m.WORKFLOWS_ROUTES),
      },
      {
        path: 'reports',
        loadChildren: () =>
          import('./modules/reports-module/reports.routes').then((m) => m.REPORTS_ROUTES),
      },
    ],
  },
  {
    path: 'auth',
    canActivate: [guestGuard],
    loadChildren: () => import('./modules/auth-module/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: 'errors/404',
    loadComponent: () =>
      import('./shared/features/error/error404.component').then((m) => m.Error404Component),
  },
  { path: '**', redirectTo: 'errors/404' },
];
