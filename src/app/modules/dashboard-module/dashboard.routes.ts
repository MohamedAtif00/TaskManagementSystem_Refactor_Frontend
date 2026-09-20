import { Routes } from '@angular/router';
import { DASHBOARD_DI_CONTAINER } from './features/dashboard-screen/di_container';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    providers: DASHBOARD_DI_CONTAINER,
    loadComponent: () =>
      import('./features/dashboard-screen/presentation/dashboard.component').then(
        (m) => m.DashboardComponent,
      ),
  },
];
