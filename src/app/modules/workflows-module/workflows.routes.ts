import { Routes } from '@angular/router';
import { roleGuard } from '@core/guards/role.guard';
import { PermissionCodes } from '@core/models/permission-codes';
import { UserRole } from '@core/models/user-role';
import { SCHEMA_LIST_DI_CONTAINER } from './features/schema-list-screen/di_container';
import { TASK_BANK_LIST_DI_CONTAINER } from './features/task-bank-list-screen/di_container';

const ADMIN_DATA = {
  roles: [UserRole.ProjectManager, UserRole.Owner],
  permissions: [PermissionCodes.Workflows.Read],
};

export const WORKFLOWS_ROUTES: Routes = [
  { path: '', redirectTo: 'schemas', pathMatch: 'full' },
  {
    path: 'schemas',
    canActivate: [roleGuard],
    data: ADMIN_DATA,
    providers: SCHEMA_LIST_DI_CONTAINER,
    loadComponent: () =>
      import('./features/schema-list-screen/presentation/schema-list.component').then((m) => m.SchemaListComponent),
  },
  {
    path: 'task-bank',
    canActivate: [roleGuard],
    data: ADMIN_DATA,
    providers: TASK_BANK_LIST_DI_CONTAINER,
    loadComponent: () =>
      import('./features/task-bank-list-screen/presentation/task-bank-list.component').then(
        (m) => m.TaskBankListComponent,
      ),
  },
];
