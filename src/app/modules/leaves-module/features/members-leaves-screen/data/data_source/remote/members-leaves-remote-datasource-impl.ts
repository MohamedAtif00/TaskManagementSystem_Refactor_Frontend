import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, forkJoin } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ListPageResponse } from '@core/models/list-page.model';
import { API, apiPath } from '@core/network/api/api.const';
import { BalancesDto, hoursBetween, lastComment, mapBalances } from '@core/network/hr-map';
import { mapHttpError } from '@core/network/http-error';
import { NetworkService } from '@core/network/network.service';
import { UserDirectoryService } from '@core/network/user-directory.service';
import {
  ForgotClockRequestEntity,
  LeaveRequestEntity,
  LeaveStatus,
  LeaveType,
  PermissionRequestEntity,
  PermissionType,
  WfhRequestEntity,
} from '../../../../my-leaves-screen/domain/entity/my-leaves.entity';
import { MemberLeaveHistoryModel, MemberLeaveRowModel } from '../../model/members-leaves.model';
import { MembersLeavesRemoteDataSource } from './members-leaves-remote-datasource';

interface SearchResult<T> {
  items?: T[];
}

interface MemberBalanceDto {
  userId: number;
  code: string;
  name: string;
  annualLeave: number;
  annualLeaveMax: number;
  emergencyLeave: number;
  emergencyLeaveMax: number;
  sickLeave: number;
  permission: number;
  permissionMax: number;
  workFromHome: number;
  workFromHomeMax: number;
  fromNextBalanceDaysUsed: number;
}

@Injectable()
export class MembersLeavesRemoteDataSourceImpl extends MembersLeavesRemoteDataSource {
  constructor(
    private network: NetworkService,
    private users: UserDirectoryService,
  ) {
    super();
  }

  getMembers(page: number, pageSize: number): Observable<ListPageResponse<MemberLeaveRowModel>> {
    const params = new HttpParams().set('page', String(page)).set('pageSize', String(pageSize));
    return this.network.get<ListPageResponse<MemberBalanceDto>>(API.Leaves.Balances, params).pipe(
      map((pageResult) => ({
        items: (pageResult.items ?? []).map((row) => ({
          id: row.userId,
          name: row.name,
          code: row.code,
          balances: mapBalances({
            annualLeave: row.annualLeave,
            annualLeaveMax: row.annualLeaveMax,
            emergencyLeave: row.emergencyLeave,
            emergencyLeaveMax: row.emergencyLeaveMax,
            sickLeave: row.sickLeave,
            permission: row.permission,
            permissionMax: row.permissionMax,
            workFromHome: row.workFromHome,
            workFromHomeMax: row.workFromHomeMax,
            fromNextBalanceDaysUsed: row.fromNextBalanceDaysUsed,
          }),
        })),
        page: pageResult.page,
        pageSize: pageResult.pageSize,
        totalCount: pageResult.totalCount,
      })),
      catchError(mapHttpError),
    );
  }

  getHistory(userId: number): Observable<MemberLeaveHistoryModel> {
    const params = new HttpParams({ fromObject: { page: '1', pageSize: '100' } });
    return forkJoin({
      directory: this.users.list(),
      balances: this.network.get<BalancesDto>(apiPath(API.Leaves.BalancesByUser, { userId })),
      leaves: this.network.get<unknown[] | SearchResult<unknown>>(API.Leaves.Search, params),
      permissions: this.network.get<unknown[] | SearchResult<unknown>>(API.Permissions.Search, params),
      wfh: this.network.get<unknown[] | SearchResult<unknown>>(API.WorkFromHome.Search, params),
    }).pipe(
      map(({ directory, balances, leaves, permissions, wfh }) => {
        const user = directory.find((row) => row.id === userId) ?? { id: userId, name: `User ${userId}`, code: '' };
        const userRef = { id: user.id, name: user.name, code: user.code };
        return {
          user: userRef,
          balances: mapBalances(balances),
          leaves: this.items(leaves)
            .filter((row) => row['userId'] === userId)
            .map((row) => this.toLeave(row, userRef)),
          permissions: this.items(permissions)
            .filter((row) => row['userId'] === userId)
            .map((row) => this.toPermission(row, userRef)),
          wfh: this.items(wfh)
            .filter((row) => row['userId'] === userId)
            .map((row) => this.toWfh(row, userRef)),
        };
      }),
      catchError(mapHttpError),
    );
  }

  private items(result: unknown[] | SearchResult<unknown>): Array<Record<string, unknown>> {
    return (Array.isArray(result) ? result : (result.items ?? [])) as Array<Record<string, unknown>>;
  }

  private toLeave(row: Record<string, unknown>, userRef: { id: number; name: string; code: string }): LeaveRequestEntity {
    return {
      id: Number(row['id']),
      userId: Number(row['userId']),
      user: userRef,
      type: String(row['type']) as LeaveType,
      startDate: String(row['startDate']).slice(0, 10),
      endDate: String(row['endDate']).slice(0, 10),
      duration: Number(row['workingDays'] ?? 1),
      reason: row['reason'] as string | undefined,
      status: String(row['status']) as LeaveStatus,
      dateCreated: String(row['dateCreated'] ?? row['startDate']).slice(0, 10),
      comment: lastComment(row['opinions'] as { comment?: string }[] | undefined),
    };
  }

  private toPermission(
    row: Record<string, unknown>,
    userRef: { id: number; name: string; code: string },
  ): PermissionRequestEntity {
    return {
      id: Number(row['id']),
      userId: Number(row['userId']),
      user: userRef,
      type: String(row['type']) as PermissionType,
      permissionDate: String(row['permissionDate']).slice(0, 10),
      fromTime: String(row['fromTime']),
      toTime: String(row['toTime']),
      duration: hoursBetween(String(row['fromTime']), String(row['toTime'])),
      reason: row['reason'] as string | undefined,
      status: String(row['status']) as LeaveStatus,
      dateCreated: String(row['createdAt'] ?? row['permissionDate']).slice(0, 10),
      comment: lastComment(row['opinions'] as { comment?: string }[] | undefined),
    };
  }

  private toWfh(row: Record<string, unknown>, userRef: { id: number; name: string; code: string }): WfhRequestEntity {
    return {
      id: Number(row['id']),
      userId: Number(row['userId']),
      user: userRef,
      date: String(row['date']).slice(0, 10),
      note: row['noteForManager'] as string | undefined,
      status: String(row['status']) as LeaveStatus,
      dateCreated: String(row['dateCreated'] ?? row['date']).slice(0, 10),
      comment: lastComment(row['opinions'] as { comment?: string }[] | undefined),
    };
  }
}
