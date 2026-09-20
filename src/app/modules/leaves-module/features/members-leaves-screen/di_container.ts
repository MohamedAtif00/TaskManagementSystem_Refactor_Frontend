import { Provider } from '@angular/core';
import { MembersLeavesRepository } from './domain/repository/members-leaves.repository';
import { MembersLeavesImplementationRepository } from './data/repository/members-leaves-implementation.repository';
import { MembersLeavesRemoteDataSource } from './data/data_source/remote/members-leaves-remote-datasource';
import { MembersLeavesRemoteDataSourceImpl } from './data/data_source/remote/members-leaves-remote-datasource-impl';
import { MembersLeavesLocalDataSource } from './data/data_source/local/members-leaves-local-datasource';
import { MembersLeavesLocalDataSourceImpl } from './data/data_source/local/members-leaves-local-datasource-impl';
import { GetMembersLeavesUseCase } from './domain/usecase/get-members-leaves.usecase';
import { GetMemberLeaveHistoryUseCase } from './domain/usecase/get-member-leave-history.usecase';

export const MEMBERS_LEAVES_DI_CONTAINER: Provider[] = [
  { provide: MembersLeavesRepository, useClass: MembersLeavesImplementationRepository },
  { provide: MembersLeavesRemoteDataSource, useClass: MembersLeavesRemoteDataSourceImpl },
  { provide: MembersLeavesLocalDataSource, useClass: MembersLeavesLocalDataSourceImpl },
  GetMembersLeavesUseCase,
  GetMemberLeaveHistoryUseCase,
];
