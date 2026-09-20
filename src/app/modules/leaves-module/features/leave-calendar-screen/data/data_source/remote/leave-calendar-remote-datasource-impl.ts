import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { API, apiPath } from '@core/network/api/api.const';
import { mapHttpError } from '@core/network/http-error';
import { NetworkService } from '@core/network/network.service';
import { DirectoryUser, UserDirectoryService } from '@core/network/user-directory.service';
import { DecidePayload, LeaveKind, LeaveQueueFilters, LeaveStatus } from '../../../domain/entity/leave-calendar.entity';
import { LeaveQueueModel } from '../../model/leave-calendar.model';
import { hoursBetween, lastComment } from '@core/network/hr-map';
import { LeaveCalendarRemoteDataSource } from './leave-calendar-remote-datasource';

interface LeaveDto {
  id: number;
  userId: number;
  type: string;
  status: string;
  startDate: string;
  endDate: string;
  workingDays?: number;
  reason?: string;
  noteForManager?: string;
  dateCreated?: string;
  opinions?: { comment?: string }[];
}

interface PermissionDto {
  id: number;
  userId: number;
  type: string;
  status: string;
  permissionDate: string;
  fromTime: string;
  toTime: string;
  reason?: string;
  createdAt?: string;
  opinions?: { comment?: string }[];
}

interface WfhDto {
  id: number;
  userId: number;
  date: string;
  status: string;
  noteForManager?: string;
  dateCreated?: string;
  opinions?: { comment?: string }[];
}

interface SearchResult<T> {
  items?: T[];
  totalCount?: number;
}

@Injectable()
export class LeaveCalendarRemoteDataSourceImpl extends LeaveCalendarRemoteDataSource {
  constructor(
    private network: NetworkService,
    private users: UserDirectoryService,
  ) {
    super();
  }

  getQueue(kind: LeaveKind, filters: LeaveQueueFilters): Observable<LeaveQueueModel[]> {
    return this.users.list().pipe(
      switchMap((directory) => this.fetchKind(kind, filters).pipe(map((rows) => this.mapRows(kind, rows, directory, filters)))),
      catchError(mapHttpError),
    );
  }

  getDetails(kind: LeaveKind, id: number): Observable<LeaveQueueModel> {
    const url =
      kind === 'leave'
        ? apiPath(API.Leaves.ById, { id })
        : kind === 'permission'
          ? apiPath(API.Permissions.ById, { id })
          : apiPath(API.WorkFromHome.ById, { id });
    return this.users.list().pipe(
      switchMap((directory) =>
        this.network.get<LeaveDto | PermissionDto | WfhDto>(url).pipe(
          map((row) => this.mapRows(kind, [row], directory, { status: '', type: '', dateFrom: '', dateTo: '' })[0]),
        ),
      ),
      catchError(mapHttpError),
    );
  }

  decide(payload: DecidePayload): Observable<void> {
    const url =
      payload.kind === 'leave'
        ? apiPath(API.Leaves.Opinion, { id: payload.id })
        : payload.kind === 'permission'
          ? apiPath(API.Permissions.Opinion, { id: payload.id })
          : apiPath(API.WorkFromHome.Opinion, { id: payload.id });
    return this.network.post(url, { isApproved: payload.approved, comment: payload.comment }).pipe(
      map(() => undefined),
      catchError(mapHttpError),
    );
  }

  private fetchKind(kind: LeaveKind, filters: LeaveQueueFilters): Observable<unknown[]> {
    const pendingUrl =
      kind === 'leave' ? API.Leaves.Pending : kind === 'permission' ? API.Permissions.Pending : API.WorkFromHome.Pending;
    const searchUrl = kind === 'leave' ? API.Leaves.Search : kind === 'permission' ? API.Permissions.Search : API.WorkFromHome.Search;
    const params = new HttpParams({
      fromObject: {
        page: '1',
        pageSize: '100',
        ...(filters.status ? { status: filters.status } : {}),
        ...(filters.type ? { type: filters.type } : {}),
        ...(filters.dateFrom ? { fromDate: filters.dateFrom } : {}),
        ...(filters.dateTo ? { toDate: filters.dateTo } : {}),
      },
    });
    const asList = (result: unknown[] | SearchResult<unknown>) => (Array.isArray(result) ? result : (result.items ?? []));
    const search$ = this.network.get<unknown[] | SearchResult<unknown>>(searchUrl, params).pipe(map(asList));
    if (!filters.status || filters.status === 'Pending') {
      return this.network.get<unknown[] | SearchResult<unknown>>(pendingUrl).pipe(map(asList), catchError(() => search$));
    }
    return search$;
  }

  private mapRows(
    kind: LeaveKind,
    rows: unknown[],
    directory: DirectoryUser[],
    filters: LeaveQueueFilters,
  ): LeaveQueueModel[] {
    return rows
      .map((row) => this.toQueueItem(kind, row, directory))
      .filter((row) => !filters.status || row.status === filters.status)
      .filter((row) => !filters.type || row.typeLabel === filters.type || row.typeLabel.includes(filters.type));
  }

  private toQueueItem(kind: LeaveKind, raw: unknown, directory: DirectoryUser[]): LeaveQueueModel {
    const userOf = (userId: number) => {
      const found = directory.find((row) => row.id === userId);
      return { id: userId, name: found?.name ?? `User ${userId}`, code: found?.code ?? '' };
    };

    if (kind === 'leave') {
      const row = raw as LeaveDto;
      return {
        kind,
        id: row.id,
        user: userOf(row.userId),
        typeLabel: row.type,
        datesLabel: `${String(row.startDate).slice(0, 10)} – ${String(row.endDate).slice(0, 10)}`,
        durationLabel: `${row.workingDays ?? 1}d`,
        status: row.status as LeaveStatus,
        dateCreated: String(row.dateCreated ?? row.startDate).slice(0, 10),
        reason: row.reason,
        note: lastComment(row.opinions) ?? row.noteForManager,
      };
    }
    if (kind === 'permission') {
      const row = raw as PermissionDto;
      return {
        kind,
        id: row.id,
        user: userOf(row.userId),
        typeLabel: row.type,
        datesLabel: String(row.permissionDate).slice(0, 10),
        durationLabel: `${hoursBetween(row.fromTime, row.toTime)}h`,
        status: row.status as LeaveStatus,
        dateCreated: String(row.createdAt ?? row.permissionDate).slice(0, 10),
        reason: row.reason,
      };
    }
    const row = raw as WfhDto;
    return {
      kind,
      id: row.id,
      user: userOf(row.userId),
      typeLabel: 'WFH',
      datesLabel: String(row.date).slice(0, 10),
      durationLabel: '1d',
      status: row.status as LeaveStatus,
      dateCreated: String(row.dateCreated ?? row.date).slice(0, 10),
      note: row.noteForManager ?? lastComment(row.opinions),
    };
  }
}
