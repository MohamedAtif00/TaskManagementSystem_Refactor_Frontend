import { Provider } from '@angular/core';
import { ForgotClockLocalDataSource, ForgotClockRemoteDataSource } from './data/data_source/forgot-clock.datasource';
import { ForgotClockLocalDataSourceImpl } from './data/data_source/local/forgot-clock-local-datasource-impl';
import { ForgotClockRemoteDataSourceImpl } from './data/data_source/remote/forgot-clock-remote-datasource-impl';
import { ForgotClockImplementationRepository } from './data/repository/forgot-clock-implementation.repository';
import { ForgotClockRepository } from './domain/repository/forgot-clock.repository';
import {
  CancelForgotClockUseCase,
  CreateForgotClockRequestUseCase,
  ListForgotClockUseCase,
} from './domain/usecase/forgot-clock.usecase';

export const FORGOT_CLOCK_DI_CONTAINER: Provider[] = [
  { provide: ForgotClockRepository, useClass: ForgotClockImplementationRepository },
  { provide: ForgotClockRemoteDataSource, useClass: ForgotClockRemoteDataSourceImpl },
  { provide: ForgotClockLocalDataSource, useClass: ForgotClockLocalDataSourceImpl },
  ListForgotClockUseCase,
  CreateForgotClockRequestUseCase,
  CancelForgotClockUseCase,
];
