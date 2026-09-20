import { Provider } from '@angular/core';
import { ProjectListRepository } from './domain/repository/project-list.repository';
import { ProjectListImplementationRepository } from './data/repository/project-list-implementation.repository';
import { ProjectListRemoteDataSource } from './data/data_source/remote/project-list-remote-datasource';
import { ProjectListRemoteDataSourceImpl } from './data/data_source/remote/project-list-remote-datasource-impl';
import { ProjectListLocalDataSource } from './data/data_source/local/project-list-local-datasource';
import { ProjectListLocalDataSourceImpl } from './data/data_source/local/project-list-local-datasource-impl';
import { ProjectListUseCase } from './domain/usecase/project-list.usecase';

export const PROJECT_LIST_DI_CONTAINER: Provider[] = [
  { provide: ProjectListRepository, useClass: ProjectListImplementationRepository },
  { provide: ProjectListRemoteDataSource, useClass: ProjectListRemoteDataSourceImpl },
  { provide: ProjectListLocalDataSource, useClass: ProjectListLocalDataSourceImpl },
  ProjectListUseCase,
];
