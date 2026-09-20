import { Provider } from '@angular/core';
import { UserListRepository } from './domain/repository/user-list.repository';
import { UserListImplementationRepository } from './data/repository/user-list-implementation.repository';
import { UserListRemoteDataSource } from './data/data_source/remote/user-list-remote-datasource';
import { UserListRemoteDataSourceImpl } from './data/data_source/remote/user-list-remote-datasource-impl';
import { UserListLocalDataSource } from './data/data_source/local/user-list-local-datasource';
import { UserListLocalDataSourceImpl } from './data/data_source/local/user-list-local-datasource-impl';
import { UserListUseCase } from './domain/usecase/user-list.usecase';
import { GetUserUseCase } from './domain/usecase/get-user.usecase';
import { SaveUserUseCase } from './domain/usecase/save-user.usecase';
import { ArchiveUserUseCase } from './domain/usecase/archive-user.usecase';
import { UserFormOptionsUseCase } from './domain/usecase/user-form-options.usecase';

export const USER_LIST_DI_CONTAINER: Provider[] = [
  { provide: UserListRepository, useClass: UserListImplementationRepository },
  { provide: UserListRemoteDataSource, useClass: UserListRemoteDataSourceImpl },
  { provide: UserListLocalDataSource, useClass: UserListLocalDataSourceImpl },
  UserListUseCase,
  GetUserUseCase,
  SaveUserUseCase,
  ArchiveUserUseCase,
  UserFormOptionsUseCase,
];
