import { Provider } from '@angular/core';
import { MyLeavesRepository } from './domain/repository/my-leaves.repository';
import { MyLeavesImplementationRepository } from './data/repository/my-leaves-implementation.repository';
import { MyLeavesRemoteDataSource } from './data/data_source/remote/my-leaves-remote-datasource';
import { MyLeavesRemoteDataSourceImpl } from './data/data_source/remote/my-leaves-remote-datasource-impl';
import { MyLeavesLocalDataSource } from './data/data_source/local/my-leaves-local-datasource';
import { MyLeavesLocalDataSourceImpl } from './data/data_source/local/my-leaves-local-datasource-impl';
import { GetMyLeavesUseCase } from './domain/usecase/get-my-leaves.usecase';
import { CreateLeaveUseCase } from './domain/usecase/create-leave.usecase';
import { CreatePermissionUseCase } from './domain/usecase/create-permission.usecase';
import { CreateWfhUseCase } from './domain/usecase/create-wfh.usecase';
import { CancelLeaveUseCase } from './domain/usecase/cancel-leave.usecase';

export const MY_LEAVES_DI_CONTAINER: Provider[] = [
  { provide: MyLeavesRepository, useClass: MyLeavesImplementationRepository },
  { provide: MyLeavesRemoteDataSource, useClass: MyLeavesRemoteDataSourceImpl },
  { provide: MyLeavesLocalDataSource, useClass: MyLeavesLocalDataSourceImpl },
  GetMyLeavesUseCase,
  CreateLeaveUseCase,
  CreatePermissionUseCase,
  CreateWfhUseCase,
  CancelLeaveUseCase,
];
