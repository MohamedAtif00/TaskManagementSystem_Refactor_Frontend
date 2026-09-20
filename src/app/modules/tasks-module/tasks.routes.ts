import { Routes } from '@angular/router';
import { TASK_BOARD_DI_CONTAINER } from './features/task-board-screen/di_container';
import { TASK_LIST_DI_CONTAINER } from './features/task-list-screen/di_container';
import { TASK_SHEET_DI_CONTAINER } from './features/task-sheet-screen/di_container';

export const TASKS_ROUTES: Routes = [
  {
    path: '',
    providers: TASK_LIST_DI_CONTAINER,
    loadComponent: () =>
      import('./features/task-list-screen/presentation/task-list.component').then(
        (m) => m.TaskListComponent,
      ),
  },
  {
    path: ':projectId/board',
    providers: TASK_BOARD_DI_CONTAINER,
    loadComponent: () =>
      import('./features/task-board-screen/presentation/task-board.component').then(
        (m) => m.TaskBoardComponent,
      ),
  },
  {
    path: ':projectId/sheet',
    providers: TASK_SHEET_DI_CONTAINER,
    loadComponent: () =>
      import('./features/task-sheet-screen/presentation/task-sheet.component').then(
        (m) => m.TaskSheetComponent,
      ),
  },
];
