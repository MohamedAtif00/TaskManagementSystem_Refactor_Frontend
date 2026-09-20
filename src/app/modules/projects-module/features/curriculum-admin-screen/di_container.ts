import { Provider } from '@angular/core';
import { CurriculumAdminRepository } from './domain/repository/curriculum-admin.repository';
import { CurriculumAdminImplementationRepository } from './data/repository/curriculum-admin-implementation.repository';
import { CurriculumAdminRemoteDataSource } from './data/data_source/remote/curriculum-admin-remote-datasource';
import { CurriculumAdminRemoteDataSourceImpl } from './data/data_source/remote/curriculum-admin-remote-datasource-impl';
import { CurriculumAdminLocalDataSource } from './data/data_source/local/curriculum-admin-local-datasource';
import { CurriculumAdminLocalDataSourceImpl } from './data/data_source/local/curriculum-admin-local-datasource-impl';
import { GetCurriculumTreeUseCase } from './domain/usecase/get-curriculum-tree.usecase';
import { LoadCurriculumChildrenUseCase } from './domain/usecase/load-curriculum-children.usecase';
import { SaveCurriculumNodeUseCase } from './domain/usecase/save-curriculum-node.usecase';
import { ArchiveCurriculumNodeUseCase } from './domain/usecase/archive-curriculum-node.usecase';
import { CurriculumLookupsUseCase } from './domain/usecase/curriculum-lookups.usecase';
import { GetSubjectUsersUseCase } from './domain/usecase/get-subject-users.usecase';

export const CURRICULUM_ADMIN_DI_CONTAINER: Provider[] = [
  { provide: CurriculumAdminRepository, useClass: CurriculumAdminImplementationRepository },
  { provide: CurriculumAdminRemoteDataSource, useClass: CurriculumAdminRemoteDataSourceImpl },
  { provide: CurriculumAdminLocalDataSource, useClass: CurriculumAdminLocalDataSourceImpl },
  GetCurriculumTreeUseCase,
  LoadCurriculumChildrenUseCase,
  SaveCurriculumNodeUseCase,
  ArchiveCurriculumNodeUseCase,
  CurriculumLookupsUseCase,
  GetSubjectUsersUseCase,
];
