import { Routes } from '@angular/router';
import { TASK_BOARD_DI_CONTAINER } from '@modules/tasks-module/features/task-board-screen/di_container';
import { SPRINT_LIST_DI_CONTAINER } from './features/sprint-list-screen/di_container';

export const SPRINTS_ROUTES: Routes = [
  {
    path: '',
    providers: SPRINT_LIST_DI_CONTAINER,
    loadComponent: () =>
      import('./features/sprint-list-screen/presentation/sprint-list.component').then(
        (m) => m.SprintListComponent,
      ),
  },
  {
    path: ':sprintId/board',
    providers: TASK_BOARD_DI_CONTAINER,
    loadComponent: () =>
      import('@modules/tasks-module/features/task-board-screen/presentation/task-board.component').then(
        (m) => m.TaskBoardComponent,
      ),
  },
];
