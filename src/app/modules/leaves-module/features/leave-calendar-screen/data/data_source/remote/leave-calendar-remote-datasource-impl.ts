import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { BulkOpinionResponse, ForgotClockRequestResponse } from '@core/api/tms-contracts';
import { API, apiPath } from '@core/network/api/api.const';
import { hoursBetween, lastComment } from '@core/network/hr-map';
import { mapHttpError } from '@core/network/http-error';
import { NetworkService } from '@core/network/network.service';
import { DirectoryUser, UserDirectoryService } from '@core/network/user-directory.service';
import { ListPageResponse } from '@core/models/list-page.model';
import {
  BulkDecidePayload,
  BulkOpinionResult,
  DecidePayload,
  LeaveKind,
  LeaveQueueFilters,
  LeaveStatus,
} from '../../../domain/entity/leave-calendar.entity';
import { LeaveQueueModel } from '../../model/leave-calendar.model';
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
  page?: number;
  pageSize?: number;
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

  getQueue(kind: LeaveKind, filters: LeaveQueueFilters): Observable<ListPageResponse<LeaveQueueModel>> {
    return this.users.list().pipe(
      switchMap((directory) =>
        this.fetchKind(kind, filters).pipe(
          map((result) => {
            const rows = this.mapRows(kind, result.items, directory, filters);
            return {
              items: rows,
              page: result.page,
              pageSize: result.pageSize,
              totalCount: result.totalCount,
            };
          }),
        ),
      ),
      catchError(mapHttpError),
    );
  }

  getDetails(kind: LeaveKind, id: number): Observable<LeaveQueueModel> {
    const url = this.byIdUrl(kind, id);
    return this.users.list().pipe(
      switchMap((directory) =>
        this.network.get<LeaveDto | PermissionDto | WfhDto | ForgotClockRequestResponse>(url).pipe(
          map((row) =>
            this.mapRows(kind, [row], directory, {
              status: '',
              type: '',
              dateFrom: '',
              dateTo: '',
              page: 1,
              pageSize: 1,
            })[0],
          ),
        ),
      ),
      catchError(mapHttpError),
    );
  }

  decide(payload: DecidePayload): Observable<void> {
    const url = payload.asOwner ? this.approveUrl(payload.kind, payload.id) : this.opinionUrl(payload.kind, payload.id);
    const body = payload.asOwner ? {} : { isApproved: payload.approved, comment: payload.comment };
    return this.network.post(url, body).pipe(
      map(() => undefined),
      catchError(mapHttpError),
    );
  }

  bulkDecide(payload: BulkDecidePayload): Observable<BulkOpinionResult> {
    return this.network.post<BulkOpinionResponse>(this.bulkUrl(payload.kind), this.bulkBody(payload)).pipe(
      map((result) => this.toBulkResult(payload.kind, result)),
      catchError(mapHttpError),
    );
  }

  private fetchKind(kind: LeaveKind, filters: LeaveQueueFilters): Observable<ListPageResponse<unknown>> {
    const searchUrl = this.searchUrl(kind);
    const params = new HttpParams({
      fromObject: {
        page: String(filters.page),
        pageSize: String(filters.pageSize),
        ...(filters.status ? { status: filters.status } : {}),
        ...(filters.type ? { type: filters.type } : {}),
        ...(filters.dateFrom ? { fromDate: filters.dateFrom } : {}),
        ...(filters.dateTo ? { toDate: filters.dateTo } : {}),
      },
    });
    return this.network.get<unknown[] | SearchResult<unknown>>(searchUrl, params).pipe(
      map((result) => {
        if (Array.isArray(result)) {
          return {
            items: result,
            page: filters.page,
            pageSize: filters.pageSize,
            totalCount: result.length,
          };
        }
        return {
          items: result.items ?? [],
          page: result.page ?? filters.page,
          pageSize: result.pageSize ?? filters.pageSize,
          totalCount: result.totalCount ?? 0,
        };
      }),
    );
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
    if (kind === 'forgotClock') {
      const row = raw as ForgotClockRequestResponse;
      return {
        kind,
        id: row.id,
        user: userOf(row.userId),
        typeLabel: row.punchType,
        datesLabel: `${String(row.attendanceDate).slice(0, 10)} · ${row.intendedTime}`,
        durationLabel: row.punchType,
        status: row.status as LeaveStatus,
        dateCreated: String(row.createdAt).slice(0, 10),
        reason: row.reason ?? undefined,
        note: lastComment(row.opinions),
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

  private pendingUrl(kind: LeaveKind): string {
    if (kind === 'leave') return API.Leaves.Pending;
    if (kind === 'permission') return API.Permissions.Pending;
    if (kind === 'forgotClock') return API.ForgotClock.Pending;
    return API.WorkFromHome.Pending;
  }

  private searchUrl(kind: LeaveKind): string {
    if (kind === 'leave') return API.Leaves.Search;
    if (kind === 'permission') return API.Permissions.Search;
    if (kind === 'forgotClock') return API.ForgotClock.Search;
    return API.WorkFromHome.Search;
  }

  private byIdUrl(kind: LeaveKind, id: number): string {
    if (kind === 'leave') return apiPath(API.Leaves.ById, { id });
    if (kind === 'permission') return apiPath(API.Permissions.ById, { id });
    if (kind === 'forgotClock') return apiPath(API.ForgotClock.ById, { id });
    return apiPath(API.WorkFromHome.ById, { id });
  }

  private opinionUrl(kind: LeaveKind, id: number): string {
    if (kind === 'leave') return apiPath(API.Leaves.Opinion, { id });
    if (kind === 'permission') return apiPath(API.Permissions.Opinion, { id });
    if (kind === 'forgotClock') return apiPath(API.ForgotClock.Opinion, { id });
    return apiPath(API.WorkFromHome.Opinion, { id });
  }

  private approveUrl(kind: LeaveKind, id: number): string {
    if (kind === 'leave') return apiPath(API.Leaves.Approve, { id });
    if (kind === 'permission') return apiPath(API.Permissions.Approve, { id });
    if (kind === 'forgotClock') return apiPath(API.ForgotClock.Approve, { id });
    return apiPath(API.WorkFromHome.Approve, { id });
  }

  private bulkUrl(kind: LeaveKind): string {
    if (kind === 'leave') return API.Leaves.BulkOpinion;
    if (kind === 'permission') return API.Permissions.BulkOpinion;
    if (kind === 'forgotClock') return API.ForgotClock.BulkOpinion;
    return API.WorkFromHome.BulkOpinion;
  }

  private bulkBody(payload: BulkDecidePayload): Record<string, unknown> {
    const comment = payload.comment;
    const isApproved = payload.approved;
    if (payload.kind === 'leave') return { leaveRequestIds: payload.ids, isApproved, comment };
    if (payload.kind === 'permission') return { permissionIds: payload.ids, isApproved, comment };
    if (payload.kind === 'forgotClock') return { forgotClockRequestIds: payload.ids, isApproved, comment };
    return { workFromHomeRequestIds: payload.ids, isApproved, comment };
  }

  private toBulkResult(kind: LeaveKind, result: BulkOpinionResponse): BulkOpinionResult {
    const failedIds =
      kind === 'leave'
        ? result.failedLeaveRequestIds
        : kind === 'permission'
          ? result.failedPermissionIds
          : kind === 'wfh'
            ? result.failedWorkFromHomeRequestIds
            : result.failedForgotClockRequestIds;
    return {
      succeeded: result.succeeded,
      failed: result.failed,
      failedIds,
    };
  }
}
