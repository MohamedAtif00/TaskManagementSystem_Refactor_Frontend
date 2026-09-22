import { Provider } from '@angular/core';
import { TaskBoardRepository } from './domain/repository/task-board.repository';
import { TaskBoardImplementationRepository } from './data/repository/task-board-implementation.repository';
import { TaskBoardRemoteDataSource } from './data/data_source/remote/task-board-remote-datasource';
import { TaskBoardRemoteDataSourceImpl } from './data/data_source/remote/task-board-remote-datasource-impl';
import { TaskBoardLocalDataSource } from './data/data_source/local/task-board-local-datasource';
import { TaskBoardLocalDataSourceImpl } from './data/data_source/local/task-board-local-datasource-impl';
import { GetTaskBoardUseCase } from './domain/usecase/get-task-board.usecase';
import { GetTaskBoardPageUseCase } from './domain/usecase/get-task-board-page.usecase';
import { GetTaskColumnPageUseCase } from './domain/usecase/get-task-column-page.usecase';
import { GetTaskDetailsUseCase } from './domain/usecase/get-task-details.usecase';
import { ProceedTaskUseCase } from './domain/usecase/proceed-task.usecase';
import { CompleteTaskUseCase } from './domain/usecase/complete-task.usecase';
import { AssignTaskUseCase } from './domain/usecase/assign-task.usecase';
import { FlagTaskUseCase } from './domain/usecase/flag-task.usecase';
import { PauseTaskUseCase } from './domain/usecase/pause-task.usecase';
import { UpdateCommentUseCase } from './domain/usecase/update-comment.usecase';
import { DeleteCommentUseCase } from './domain/usecase/delete-comment.usecase';
import { RollbackTaskUseCase } from './domain/usecase/rollback-task.usecase';
import { CreateTaskUseCase } from './domain/usecase/create-task.usecase';
import { ListTaskBankUseCase } from './domain/usecase/list-task-bank.usecase';
import { ListCommentsUseCase } from './domain/usecase/list-comments.usecase';
import { AddCommentUseCase } from './domain/usecase/add-comment.usecase';
import { StartWorkUseCase } from './domain/usecase/start-work.usecase';
import { StopWorkUseCase } from './domain/usecase/stop-work.usecase';
import { SkipTaskUseCase } from './domain/usecase/skip-task.usecase';
import { JumpTaskUseCase } from './domain/usecase/jump-task.usecase';
import { ChangePriorityUseCase } from './domain/usecase/change-priority.usecase';
import { ListJumpPointsUseCase } from './domain/usecase/list-jump-points.usecase';
import { ListActivityUseCase } from './domain/usecase/list-activity.usecase';

export const TASK_BOARD_DI_CONTAINER: Provider[] = [
  { provide: TaskBoardRepository, useClass: TaskBoardImplementationRepository },
  { provide: TaskBoardRemoteDataSource, useClass: TaskBoardRemoteDataSourceImpl },
  { provide: TaskBoardLocalDataSource, useClass: TaskBoardLocalDataSourceImpl },
  GetTaskBoardUseCase,
  GetTaskBoardPageUseCase,
  GetTaskColumnPageUseCase,
  GetTaskDetailsUseCase,
  ProceedTaskUseCase,
  CompleteTaskUseCase,
  AssignTaskUseCase,
  FlagTaskUseCase,
  PauseTaskUseCase,
  RollbackTaskUseCase,
  CreateTaskUseCase,
  ListTaskBankUseCase,
  ListCommentsUseCase,
  AddCommentUseCase,
  UpdateCommentUseCase,
  DeleteCommentUseCase,
  StartWorkUseCase,
  StopWorkUseCase,
  SkipTaskUseCase,
  JumpTaskUseCase,
  ChangePriorityUseCase,
  ListJumpPointsUseCase,
  ListActivityUseCase,
];
