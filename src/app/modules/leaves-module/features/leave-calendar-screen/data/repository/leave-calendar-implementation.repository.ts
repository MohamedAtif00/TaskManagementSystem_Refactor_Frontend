import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { DecidePayload, LeaveKind, LeaveQueueFilters, LeaveQueueItem } from '../../domain/entity/leave-calendar.entity';
import { LeaveCalendarRepository } from '../../domain/repository/leave-calendar.repository';
import { LeaveCalendarLocalDataSource } from '../data_source/local/leave-calendar-local-datasource';
import { LeaveCalendarRemoteDataSource } from '../data_source/remote/leave-calendar-remote-datasource';
import { LeaveCalendarMapper } from '../model/leave-calendar.model';

@Injectable()
export class LeaveCalendarImplementationRepository implements LeaveCalendarRepository {
  constructor(
    private local: LeaveCalendarLocalDataSource,
    private remote: LeaveCalendarRemoteDataSource,
  ) {}

  getQueue(kind: LeaveKind, filters: LeaveQueueFilters): Observable<LeaveQueueItem[]> {
    const source = environment.useMock
      ? this.local.getQueue(kind, filters)
      : this.remote.getQueue(kind, filters);
    return source.pipe(map((rows) => rows.map((row) => LeaveCalendarMapper.toEntity(row))));
  }

  getDetails(kind: LeaveKind, id: number): Observable<LeaveQueueItem> {
    const source = environment.useMock
      ? this.local.getDetails(kind, id)
      : this.remote.getDetails(kind, id);
    return source.pipe(map((row) => LeaveCalendarMapper.toEntity(row)));
  }

  decide(payload: DecidePayload): Observable<void> {
    return environment.useMock ? this.local.decide(payload) : this.remote.decide(payload);
  }
}
