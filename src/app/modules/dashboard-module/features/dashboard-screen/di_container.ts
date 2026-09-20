import { Provider } from '@angular/core';
import { DashboardRepository } from './domain/repository/dashboard.repository';
import { DashboardImplementationRepository } from './data/repository/dashboard-implementation.repository';
import { DashboardRemoteDataSource } from './data/data_source/remote/dashboard-remote-datasource';
import { DashboardRemoteDataSourceImpl } from './data/data_source/remote/dashboard-remote-datasource-impl';
import { DashboardLocalDataSource } from './data/data_source/local/dashboard-local-datasource';
import { DashboardLocalDataSourceImpl } from './data/data_source/local/dashboard-local-datasource-impl';
import { DashboardUseCase } from './domain/usecase/dashboard.usecase';

export const DASHBOARD_DI_CONTAINER: Provider[] = [
  { provide: DashboardRepository, useClass: DashboardImplementationRepository },
  { provide: DashboardRemoteDataSource, useClass: DashboardRemoteDataSourceImpl },
  { provide: DashboardLocalDataSource, useClass: DashboardLocalDataSourceImpl },
  DashboardUseCase,
];
