import { Provider } from '@angular/core';
import { TeamListRepository } from './domain/repository/team-list.repository';
import { TeamListImplementationRepository } from './data/repository/team-list-implementation.repository';
import { TeamListRemoteDataSource } from './data/data_source/remote/team-list-remote-datasource';
import { TeamListRemoteDataSourceImpl } from './data/data_source/remote/team-list-remote-datasource-impl';
import { TeamListLocalDataSource } from './data/data_source/local/team-list-local-datasource';
import { TeamListLocalDataSourceImpl } from './data/data_source/local/team-list-local-datasource-impl';
import { TeamListUseCase } from './domain/usecase/team-list.usecase';
import { GetTeamUseCase } from './domain/usecase/get-team.usecase';
import { SaveTeamUseCase } from './domain/usecase/save-team.usecase';
import { ArchiveTeamUseCase } from './domain/usecase/archive-team.usecase';

export const TEAM_LIST_DI_CONTAINER: Provider[] = [
  { provide: TeamListRepository, useClass: TeamListImplementationRepository },
  { provide: TeamListRemoteDataSource, useClass: TeamListRemoteDataSourceImpl },
  { provide: TeamListLocalDataSource, useClass: TeamListLocalDataSourceImpl },
  TeamListUseCase,
  GetTeamUseCase,
  SaveTeamUseCase,
  ArchiveTeamUseCase,
];
