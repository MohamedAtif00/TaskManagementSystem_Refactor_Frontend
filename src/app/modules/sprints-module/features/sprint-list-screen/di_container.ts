import { Provider } from '@angular/core';
import { SprintListRepository } from './domain/repository/sprint-list.repository';
import { SprintListImplementationRepository } from './data/repository/sprint-list-implementation.repository';
import { SprintListRemoteDataSource } from './data/data_source/remote/sprint-list-remote-datasource';
import { SprintListRemoteDataSourceImpl } from './data/data_source/remote/sprint-list-remote-datasource-impl';
import { SprintListLocalDataSource } from './data/data_source/local/sprint-list-local-datasource';
import { SprintListLocalDataSourceImpl } from './data/data_source/local/sprint-list-local-datasource-impl';
import { SprintListUseCase } from './domain/usecase/sprint-list.usecase';
import { SaveSprintUseCase } from './domain/usecase/save-sprint.usecase';
import { ArchiveSprintUseCase } from './domain/usecase/archive-sprint.usecase';
import { SprintSubjectsUseCase } from './domain/usecase/sprint-subjects.usecase';
import { SprintLosUseCase } from './domain/usecase/sprint-los.usecase';

export const SPRINT_LIST_DI_CONTAINER: Provider[] = [
  { provide: SprintListRepository, useClass: SprintListImplementationRepository },
  { provide: SprintListRemoteDataSource, useClass: SprintListRemoteDataSourceImpl },
  { provide: SprintListLocalDataSource, useClass: SprintListLocalDataSourceImpl },
  SprintListUseCase,
  SaveSprintUseCase,
  ArchiveSprintUseCase,
  SprintSubjectsUseCase,
  SprintLosUseCase,
];
