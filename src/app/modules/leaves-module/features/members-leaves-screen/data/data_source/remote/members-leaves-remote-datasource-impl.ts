import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { API, apiPath } from '@core/network/api/api.const';
import { mapHttpError } from '@core/network/http-error';
import { NetworkService } from '@core/network/network.service';
import { UserDirectoryService } from '@core/network/user-directory.service';
import { LeaveRequestEntity, LeaveStatus, LeaveType, PermissionRequestEntity, PermissionType, WfhRequestEntity } from '../../../../my-leaves-screen/domain/entity/my-leaves.entity';
import { BalancesDto, hoursBetween, lastComment, mapBalances } from '@core/network/hr-map';
import { MemberLeaveHistoryModel, MemberLeaveRowModel } from '../../model/members-leaves.model';
import { MembersLeavesRemoteDataSource } from './members-leaves-remote-datasource';

interface SearchResult<T> {
  items?: T[];
}

@Injectable()
export class MembersLeavesRemoteDataSourceImpl extends MembersLeavesRemoteDataSource {
  constructor(
    private network: NetworkService,
    private users: UserDirectoryService,
  ) {
    super();
  }

  getMembers(): Observable<MemberLeaveRowModel[]> {
    return this.users.refresh().pipe(
      switchMap((users) => {
        if (!users.length) {
          return of([] as MemberLeaveRowModel[]);
        }
        return forkJoin(
          users.map((user) =>
            this.network.get<BalancesDto>(apiPath(API.Leaves.BalancesByUser, { userId: user.id })).pipe(
              map((balances) => ({
                id: user.id,
                name: user.name,
                code: user.code,
                balances: mapBalances(balances),
              })),
              catchError(() =>
                of({
                  id: user.id,
                  name: user.name,
                  code: user.code,
                  balances: mapBalances({
                    annualLeave: 0,
                    annualLeaveMax: 0,
                    emergencyLeave: 0,
                    emergencyLeaveMax: 0,
                    sickLeave: 0,
                    permission: 0,
                    permissionMax: 0,
                    workFromHome: 0,
                    workFromHomeMax: 0,
                  }),
                }),
              ),
            ),
          ),
        );
      }),
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
        const leaveRows = this.items(leaves).filter((row) => row.userId === userId) as Array<{
          id: number;
          userId: number;
          type: string;
          status: string;
          startDate: string;
          endDate: string;
          workingDays?: number;
          reason?: string;
          dateCreated?: string;
          opinions?: { comment?: string }[];
        }>;
        const permissionRows = this.items(permissions).filter((row) => row.userId === userId) as Array<{
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
        }>;
        const wfhRows = this.items(wfh).filter((row) => row.userId === userId) as Array<{
          id: number;
          userId: number;
          date: string;
          status: string;
          noteForManager?: string;
          dateCreated?: string;
          opinions?: { comment?: string }[];
        }>;
        return {
          user: userRef,
          balances: mapBalances(balances),
          leaves: leaveRows.map(
            (row): LeaveRequestEntity => ({
              id: row.id,
              userId: row.userId,
              user: userRef,
              type: row.type as LeaveType,
              startDate: String(row.startDate).slice(0, 10),
              endDate: String(row.endDate).slice(0, 10),
              duration: row.workingDays ?? 1,
              reason: row.reason,
              status: row.status as LeaveStatus,
              dateCreated: String(row.dateCreated ?? row.startDate).slice(0, 10),
              comment: lastComment(row.opinions),
            }),
          ),
          permissions: permissionRows.map(
            (row): PermissionRequestEntity => ({
              id: row.id,
              userId: row.userId,
              user: userRef,
              type: row.type as PermissionType,
              permissionDate: String(row.permissionDate).slice(0, 10),
              fromTime: row.fromTime,
              toTime: row.toTime,
              duration: hoursBetween(row.fromTime, row.toTime),
              reason: row.reason,
              status: row.status as LeaveStatus,
              dateCreated: String(row.createdAt ?? row.permissionDate).slice(0, 10),
              comment: lastComment(row.opinions),
            }),
          ),
          wfh: wfhRows.map(
            (row): WfhRequestEntity => ({
              id: row.id,
              userId: row.userId,
              user: userRef,
              date: String(row.date).slice(0, 10),
              note: row.noteForManager,
              status: row.status as LeaveStatus,
              dateCreated: String(row.dateCreated ?? row.date).slice(0, 10),
              comment: lastComment(row.opinions),
            }),
          ),
        };
      }),
      catchError(mapHttpError),
    );
  }

  private items(result: unknown[] | SearchResult<unknown>): Array<{ userId: number }> {
    return (Array.isArray(result) ? result : (result.items ?? [])) as Array<{ userId: number }>;
  }
}
