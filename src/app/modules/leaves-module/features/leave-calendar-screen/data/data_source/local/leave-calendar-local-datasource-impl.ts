import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { ListPageResponse } from '@core/models/list-page.model';
import { LeaveListFilters, TmsMockStore } from '@core/mock/tms-mock.store';
import {
  BulkDecidePayload,
  BulkOpinionResult,
  DecidePayload,
  LeaveKind,
  LeaveQueueFilters,
  LeaveQueueItem,
} from '../../../domain/entity/leave-calendar.entity';
import { LeaveQueueModel } from '../../model/leave-calendar.model';
import { LeaveCalendarLocalDataSource } from './leave-calendar-local-datasource';

@Injectable()
export class LeaveCalendarLocalDataSourceImpl extends LeaveCalendarLocalDataSource {
  constructor(private store: TmsMockStore) {
    super();
  }

  getQueue(kind: LeaveKind, filters: LeaveQueueFilters): Observable<ListPageResponse<LeaveQueueModel>> {
    const all = this.mapKind(kind, filters);
    const skip = (filters.page - 1) * filters.pageSize;
    const items = all.slice(skip, skip + filters.pageSize);
    return of({
      items,
      page: filters.page,
      pageSize: filters.pageSize,
      totalCount: all.length,
    }).pipe(delay(120));
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
      } else if (payload.kind === 'wfh') {
        this.store.decideWfh(payload.id, payload.approved, payload.comment);
      }
      return of(undefined).pipe(delay(80));
    } catch (err) {
      return throwError(() => err);
    }
  }

  bulkDecide(payload: BulkDecidePayload): Observable<BulkOpinionResult> {
    let succeeded = 0;
    let failed = 0;
    const failedIds: number[] = [];
    for (const id of payload.ids) {
      try {
        if (payload.kind === 'leave') {
          this.store.decideLeave(id, payload.approved, payload.comment);
        } else if (payload.kind === 'permission') {
          this.store.decidePermission(id, payload.approved, payload.comment);
        } else if (payload.kind === 'wfh') {
          this.store.decideWfh(id, payload.approved, payload.comment);
        }
        succeeded++;
      } catch {
        failed++;
        failedIds.push(id);
      }
    }
    return of({ succeeded, failed, failedIds }).pipe(delay(80));
  }

  private mapKind(
    kind: LeaveKind,
    filters: LeaveQueueFilters = { status: '', type: '', dateFrom: '', dateTo: '', page: 1, pageSize: 20 },
  ): LeaveQueueItem[] {
    if (kind === 'forgotClock') {
      return [];
    }
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
