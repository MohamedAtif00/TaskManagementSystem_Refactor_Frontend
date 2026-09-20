import { Provider } from '@angular/core';
import { TASK_BOARD_DI_CONTAINER } from '../task-board-screen/di_container';
import { TaskSheetRepository } from './domain/repository/task-sheet.repository';
import { TaskSheetImplementationRepository } from './data/repository/task-sheet-implementation.repository';
import { TaskSheetRemoteDataSource } from './data/data_source/remote/task-sheet-remote-datasource';
import { TaskSheetRemoteDataSourceImpl } from './data/data_source/remote/task-sheet-remote-datasource-impl';
import { TaskSheetLocalDataSource } from './data/data_source/local/task-sheet-local-datasource';
import { TaskSheetLocalDataSourceImpl } from './data/data_source/local/task-sheet-local-datasource-impl';
import { GetTaskSheetUseCase } from './domain/usecase/get-task-sheet.usecase';

export const TASK_SHEET_DI_CONTAINER: Provider[] = [
  ...TASK_BOARD_DI_CONTAINER,
  { provide: TaskSheetRepository, useClass: TaskSheetImplementationRepository },
  { provide: TaskSheetRemoteDataSource, useClass: TaskSheetRemoteDataSourceImpl },
  { provide: TaskSheetLocalDataSource, useClass: TaskSheetLocalDataSourceImpl },
  GetTaskSheetUseCase,
];
