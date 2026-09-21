import { Provider } from '@angular/core';
import { LeaveCalendarRepository } from './domain/repository/leave-calendar.repository';
import { LeaveCalendarImplementationRepository } from './data/repository/leave-calendar-implementation.repository';
import { LeaveCalendarRemoteDataSource } from './data/data_source/remote/leave-calendar-remote-datasource';
import { LeaveCalendarRemoteDataSourceImpl } from './data/data_source/remote/leave-calendar-remote-datasource-impl';
import { LeaveCalendarLocalDataSource } from './data/data_source/local/leave-calendar-local-datasource';
import { LeaveCalendarLocalDataSourceImpl } from './data/data_source/local/leave-calendar-local-datasource-impl';
import { GetLeaveQueueUseCase } from './domain/usecase/get-leave-queue.usecase';
import { GetLeaveDetailsUseCase } from './domain/usecase/get-leave-details.usecase';
import { DecideLeaveUseCase } from './domain/usecase/decide-leave.usecase';
import { BulkDecideLeaveUseCase } from './domain/usecase/bulk-decide-leave.usecase';

export const LEAVE_CALENDAR_DI_CONTAINER: Provider[] = [
  { provide: LeaveCalendarRepository, useClass: LeaveCalendarImplementationRepository },
  { provide: LeaveCalendarRemoteDataSource, useClass: LeaveCalendarRemoteDataSourceImpl },
  { provide: LeaveCalendarLocalDataSource, useClass: LeaveCalendarLocalDataSourceImpl },
  GetLeaveQueueUseCase,
  GetLeaveDetailsUseCase,
  DecideLeaveUseCase,
  BulkDecideLeaveUseCase,
];
