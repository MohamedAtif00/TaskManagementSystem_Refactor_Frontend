import { Injectable } from '@angular/core';
import { Observable, forkJoin } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { API, apiPath } from '@core/network/api/api.const';
import { mapHttpError } from '@core/network/http-error';
import { NetworkService } from '@core/network/network.service';
import { UserDirectoryService } from '@core/network/user-directory.service';
import { BalancesDto, hoursBetween, lastComment, mapBalances } from '@core/network/hr-map';
import {
  CancelRequestPayload,
  CreateLeavePayload,
  CreatePermissionPayload,
  CreateWfhPayload,
  LeaveRequestEntity,
  LeaveStatus,
  LeaveType,
  PermissionRequestEntity,
  PermissionType,
  WfhRequestEntity,
} from '../../../domain/entity/my-leaves.entity';
import { MyLeavesModel } from '../../model/my-leaves.model';
import { MyLeavesRemoteDataSource } from './my-leaves-remote-datasource';

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

@Injectable()
export class MyLeavesRemoteDataSourceImpl extends MyLeavesRemoteDataSource {
  constructor(
    private network: NetworkService,
    private users: UserDirectoryService,
  ) {
    super();
  }

  getMine(userId: number): Observable<MyLeavesModel> {
    return forkJoin({
      balances: this.network.get<BalancesDto>(API.Leaves.Balances),
      leaves: this.network.get<LeaveDto[]>(API.Leaves.List),
      permissions: this.network.get<PermissionDto[]>(API.Permissions.List),
      wfh: this.network.get<WfhDto[]>(API.WorkFromHome.List),
      directory: this.users.list(),
    }).pipe(
      map(({ balances, leaves, permissions, wfh, directory }) => {
        const me = directory.find((row) => row.id === userId) ?? { id: userId, name: 'Me', code: '' };
        const user = { id: me.id, name: me.name, code: me.code };
        return {
          balances: mapBalances(balances),
          leaves: leaves.map((row) => this.toLeave(row, user)),
          permissions: permissions.map((row) => this.toPermission(row, user)),
          wfh: wfh.map((row) => this.toWfh(row, user)),
        };
      }),
      catchError(mapHttpError),
    );
  }

  createLeave(_userId: number, payload: CreateLeavePayload): Observable<void> {
    return this.network
      .post(API.Leaves.List, {
        type: payload.type,
        startDate: payload.startDate,
        endDate: payload.endDate,
        reason: payload.reason,
      })
      .pipe(
        map(() => undefined),
        catchError(mapHttpError),
      );
  }

  createPermission(_userId: number, payload: CreatePermissionPayload): Observable<void> {
    return this.network
      .post(API.Permissions.List, {
        type: payload.type,
        permissionDate: payload.permissionDate,
        fromTime: payload.fromTime,
        toTime: payload.toTime,
        reason: payload.reason,
      })
      .pipe(
        map(() => undefined),
        catchError(mapHttpError),
      );
  }

  createWfh(_userId: number, payload: CreateWfhPayload): Observable<void> {
    return this.network
      .post(API.WorkFromHome.List, { date: payload.date, noteForManager: payload.note })
      .pipe(
        map(() => undefined),
        catchError(mapHttpError),
      );
  }

  cancel(_userId: number, payload: CancelRequestPayload): Observable<void> {
    const url =
      payload.kind === 'leave'
        ? apiPath(API.Leaves.Cancel, { id: payload.id })
        : payload.kind === 'permission'
          ? apiPath(API.Permissions.Cancel, { id: payload.id })
          : apiPath(API.WorkFromHome.Cancel, { id: payload.id });
    return this.network.put(url, {}).pipe(
      map(() => undefined),
      catchError(mapHttpError),
    );
  }

  private toLeave(row: LeaveDto, user: { id: number; name: string; code: string }): LeaveRequestEntity {
    return {
      id: row.id,
      userId: row.userId,
      user,
      type: row.type as LeaveType,
      startDate: String(row.startDate).slice(0, 10),
      endDate: String(row.endDate).slice(0, 10),
      duration: row.workingDays ?? 1,
      reason: row.reason,
      status: row.status as LeaveStatus,
      dateCreated: String(row.dateCreated ?? row.startDate).slice(0, 10),
      comment: lastComment(row.opinions),
    };
  }

  private toPermission(row: PermissionDto, user: { id: number; name: string; code: string }): PermissionRequestEntity {
    return {
      id: row.id,
      userId: row.userId,
      user,
      type: row.type as PermissionType,
      permissionDate: String(row.permissionDate).slice(0, 10),
      fromTime: row.fromTime,
      toTime: row.toTime,
      duration: hoursBetween(row.fromTime, row.toTime),
      reason: row.reason,
      status: row.status as LeaveStatus,
      dateCreated: String(row.createdAt ?? row.permissionDate).slice(0, 10),
      comment: lastComment(row.opinions),
    };
  }

  private toWfh(row: WfhDto, user: { id: number; name: string; code: string }): WfhRequestEntity {
    return {
      id: row.id,
      userId: row.userId,
      user,
      date: String(row.date).slice(0, 10),
      note: row.noteForManager,
      status: row.status as LeaveStatus,
      dateCreated: String(row.dateCreated ?? row.date).slice(0, 10),
      comment: lastComment(row.opinions),
    };
  }
}
