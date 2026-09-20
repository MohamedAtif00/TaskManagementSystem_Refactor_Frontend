import { Provider } from '@angular/core';
import { RoleListRepository } from './domain/repository/role-list.repository';
import { RoleListImplementationRepository } from './data/repository/role-list-implementation.repository';
import { RoleListRemoteDataSource } from './data/data_source/remote/role-list-remote-datasource';
import { RoleListRemoteDataSourceImpl } from './data/data_source/remote/role-list-remote-datasource-impl';
import { RoleListLocalDataSource } from './data/data_source/local/role-list-local-datasource';
import { RoleListLocalDataSourceImpl } from './data/data_source/local/role-list-local-datasource-impl';
import { RoleListUseCase } from './domain/usecase/role-list.usecase';
import { RolePermissionsUseCase } from './domain/usecase/role-permissions.usecase';
import { SaveRoleUseCase } from './domain/usecase/save-role.usecase';
import { DeleteRoleUseCase } from './domain/usecase/delete-role.usecase';

export const ROLE_LIST_DI_CONTAINER: Provider[] = [
  { provide: RoleListRepository, useClass: RoleListImplementationRepository },
  { provide: RoleListRemoteDataSource, useClass: RoleListRemoteDataSourceImpl },
  { provide: RoleListLocalDataSource, useClass: RoleListLocalDataSourceImpl },
  RoleListUseCase,
  RolePermissionsUseCase,
  SaveRoleUseCase,
  DeleteRoleUseCase,
];
