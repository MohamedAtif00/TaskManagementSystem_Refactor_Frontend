import { Routes } from '@angular/router';
import { roleGuard } from '@core/guards/role.guard';
import { PermissionCodes } from '@core/models/permission-codes';
import { TASK_BOARD_DI_CONTAINER } from './features/task-board-screen/di_container';
import { TASK_LIST_DI_CONTAINER } from './features/task-list-screen/di_container';
import { TASK_SHEET_DI_CONTAINER } from './features/task-sheet-screen/di_container';

export const TASKS_ROUTES: Routes = [
  {
    path: 'user-tasks',
    canActivate: [roleGuard],
    data: { permissions: [PermissionCodes.Tickets.Read] },
    loadComponent: () =>
      import('./features/user-tasks-screen/presentation/user-tasks.component').then((m) => m.UserTasksComponent),
  },
  {
    path: '',
    canActivate: [roleGuard],
    data: { permissions: [PermissionCodes.Tickets.Read] },
    providers: TASK_LIST_DI_CONTAINER,
    loadComponent: () =>
      import('./features/task-list-screen/presentation/task-list.component').then(
        (m) => m.TaskListComponent,
      ),
  },
  {
    path: ':projectId/board',
    canActivate: [roleGuard],
    data: { permissions: [PermissionCodes.Tickets.Read] },
    providers: TASK_BOARD_DI_CONTAINER,
    loadComponent: () =>
      import('./features/task-board-screen/presentation/task-board.component').then(
        (m) => m.TaskBoardComponent,
      ),
  },
  {
    path: ':projectId/sheet',
    canActivate: [roleGuard],
    data: { permissions: [PermissionCodes.Tickets.Read] },
    providers: TASK_SHEET_DI_CONTAINER,
    loadComponent: () =>
      import('./features/task-sheet-screen/presentation/task-sheet.component').then(
        (m) => m.TaskSheetComponent,
      ),
  },
];
