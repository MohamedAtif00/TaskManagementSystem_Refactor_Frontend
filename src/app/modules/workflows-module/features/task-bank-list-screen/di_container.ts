import { Provider } from '@angular/core';
import { TaskBankListRepository } from './domain/repository/task-bank-list.repository';
import { TaskBankListImplementationRepository } from './data/repository/task-bank-list-implementation.repository';
import { TaskBankListRemoteDataSource } from './data/data_source/remote/task-bank-list-remote-datasource';
import { TaskBankListRemoteDataSourceImpl } from './data/data_source/remote/task-bank-list-remote-datasource-impl';
import { TaskBankListLocalDataSource } from './data/data_source/local/task-bank-list-local-datasource';
import { TaskBankListLocalDataSourceImpl } from './data/data_source/local/task-bank-list-local-datasource-impl';
import { TaskBankListUseCase } from './domain/usecase/task-bank-list.usecase';
import { SaveTaskBankItemUseCase } from './domain/usecase/save-task-bank-item.usecase';
import { ArchiveTaskBankItemUseCase } from './domain/usecase/archive-task-bank-item.usecase';
import { TaskBankTeamsUseCase } from './domain/usecase/task-bank-teams.usecase';

export const TASK_BANK_LIST_DI_CONTAINER: Provider[] = [
  { provide: TaskBankListRepository, useClass: TaskBankListImplementationRepository },
  { provide: TaskBankListRemoteDataSource, useClass: TaskBankListRemoteDataSourceImpl },
  { provide: TaskBankListLocalDataSource, useClass: TaskBankListLocalDataSourceImpl },
  TaskBankListUseCase,
  SaveTaskBankItemUseCase,
  ArchiveTaskBankItemUseCase,
  TaskBankTeamsUseCase,
];
