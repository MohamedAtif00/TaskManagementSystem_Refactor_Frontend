import { Provider } from '@angular/core';
import { TaskListRepository } from './domain/repository/task-list.repository';
import { TaskListImplementationRepository } from './data/repository/task-list-implementation.repository';
import { TaskListRemoteDataSource } from './data/data_source/remote/task-list-remote-datasource';
import { TaskListRemoteDataSourceImpl } from './data/data_source/remote/task-list-remote-datasource-impl';
import { TaskListLocalDataSource } from './data/data_source/local/task-list-local-datasource';
import { TaskListLocalDataSourceImpl } from './data/data_source/local/task-list-local-datasource-impl';
import { TaskFilterOptionsUseCase } from './domain/usecase/task-filter-options.usecase';
import { TaskListUseCase } from './domain/usecase/task-list.usecase';

export const TASK_LIST_DI_CONTAINER: Provider[] = [
  { provide: TaskListRepository, useClass: TaskListImplementationRepository },
  { provide: TaskListRemoteDataSource, useClass: TaskListRemoteDataSourceImpl },
  { provide: TaskListLocalDataSource, useClass: TaskListLocalDataSourceImpl },
  TaskListUseCase,
  TaskFilterOptionsUseCase,
];
