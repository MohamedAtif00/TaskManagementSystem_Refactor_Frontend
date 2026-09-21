import { Provider } from '@angular/core';
import { HolidaysLocalDataSource, HolidaysRemoteDataSource } from './data/data_source/holidays.datasource';
import { HolidaysLocalDataSourceImpl } from './data/data_source/local/holidays-local-datasource-impl';
import { HolidaysRemoteDataSourceImpl } from './data/data_source/remote/holidays-remote-datasource-impl';
import { HolidaysImplementationRepository } from './data/repository/holidays-implementation.repository';
import { HolidaysRepository } from './domain/repository/holidays.repository';
import { DeleteHolidayUseCase, ListHolidaysUseCase, SaveHolidayUseCase } from './domain/usecase/holidays.usecase';

export const HOLIDAYS_DI_CONTAINER: Provider[] = [
  { provide: HolidaysRepository, useClass: HolidaysImplementationRepository },
  { provide: HolidaysRemoteDataSource, useClass: HolidaysRemoteDataSourceImpl },
  { provide: HolidaysLocalDataSource, useClass: HolidaysLocalDataSourceImpl },
  ListHolidaysUseCase,
  SaveHolidayUseCase,
  DeleteHolidayUseCase,
];
