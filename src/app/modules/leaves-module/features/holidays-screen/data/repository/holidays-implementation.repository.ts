import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { HolidayEntity, HolidayFormPayload } from '../../domain/entity/holidays.entity';
import { HolidaysRepository } from '../../domain/repository/holidays.repository';
import { HolidaysLocalDataSource, HolidaysRemoteDataSource } from '../data_source/holidays.datasource';

@Injectable()
export class HolidaysImplementationRepository implements HolidaysRepository {
  constructor(
    private local: HolidaysLocalDataSource,
    private remote: HolidaysRemoteDataSource,
  ) {}

  list(): Observable<HolidayEntity[]> {
    return environment.useMock ? this.local.list() : this.remote.list();
  }

  save(payload: HolidayFormPayload): Observable<HolidayEntity> {
    return environment.useMock ? this.local.save(payload) : this.remote.save(payload);
  }

  remove(id: number): Observable<void> {
    return environment.useMock ? this.local.remove(id) : this.remote.remove(id);
  }
}
