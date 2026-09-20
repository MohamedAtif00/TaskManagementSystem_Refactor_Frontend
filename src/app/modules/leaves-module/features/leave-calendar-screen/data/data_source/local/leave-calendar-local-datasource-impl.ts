import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { LeaveListFilters, TmsMockStore } from '@core/mock/tms-mock.store';
import { DecidePayload, LeaveKind, LeaveQueueFilters, LeaveQueueItem } from '../../../domain/entity/leave-calendar.entity';
import { LeaveQueueModel } from '../../model/leave-calendar.model';
import { LeaveCalendarLocalDataSource } from './leave-calendar-local-datasource';

@Injectable()
export class LeaveCalendarLocalDataSourceImpl extends LeaveCalendarLocalDataSource {
  constructor(private store: TmsMockStore) {
    super();
  }

  getQueue(kind: LeaveKind, filters: LeaveQueueFilters): Observable<LeaveQueueModel[]> {
    return of(this.mapKind(kind, filters)).pipe(delay(120));
  }

  getDetails(kind: LeaveKind, id: number): Observable<LeaveQueueModel> {
    const item = this.mapKind(kind).find((row) => row.id === id);
    return item ? of(item).pipe(delay(80)) : throwError(() => new Error('Request not found'));
  }

  decide(payload: DecidePayload): Observable<void> {
    try {
      if (payload.kind === 'leave') {
        this.store.decideLeave(payload.id, payload.approved, payload.comment);
      } else if (payload.kind === 'permission') {
        this.store.decidePermission(payload.id, payload.approved, payload.comment);
      } else {
        this.store.decideWfh(payload.id, payload.approved, payload.comment);
      }
      return of(undefined).pipe(delay(80));
    } catch (err) {
      return throwError(() => err);
    }
  }

  private mapKind(kind: LeaveKind, filters: LeaveQueueFilters = { status: '', type: '', dateFrom: '', dateTo: '' }): LeaveQueueItem[] {
    const query: LeaveListFilters = {
      status: filters.status || undefined,
      type: filters.type || undefined,
      dateFrom: filters.dateFrom || undefined,
      dateTo: filters.dateTo || undefined,
    };
    if (kind === 'leave') {
      return this.store.listLeaves(query).map((row) => ({
        kind,
        id: row.id,
        user: row.user,
        typeLabel: row.type,
        datesLabel: `${row.startDate} – ${row.endDate}`,
        durationLabel: `${row.duration}d`,
        status: row.status,
        dateCreated: row.dateCreated,
        reason: row.reason,
      }));
    }
    if (kind === 'permission') {
      return this.store.listPermissions(query).map((row) => ({
        kind,
        id: row.id,
        user: row.user,
        typeLabel: row.type,
        datesLabel: `${row.permissionDate} ${row.fromTime}–${row.toTime}`,
        durationLabel: `${row.duration}h`,
        status: row.status,
        dateCreated: row.dateCreated,
        reason: row.reason,
      }));
    }
    return this.store.listWfh(query).map((row) => ({
      kind,
      id: row.id,
      user: row.user,
      typeLabel: 'WFH',
      datesLabel: row.date,
      durationLabel: '1d',
      status: row.status,
      dateCreated: row.dateCreated,
      note: row.note,
    }));
  }
}
