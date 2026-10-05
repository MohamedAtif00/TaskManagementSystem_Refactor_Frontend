import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { ListPageResponse } from '@core/models/list-page.model';
import { mapApiRole } from '@core/models/role-map';
import { TmsMockStore } from '@core/mock/tms-mock.store';
import { UserBalanceEntity, UserBalanceUpdate, UserFormPayload, UserListParams } from '../../../domain/entity/user-list.entity';
import { UserDetailModel, UserFormOptionsModel, UserListItemModel } from '../../model/user-list.model';
import { UserListLocalDataSource } from './user-list-local-datasource';

@Injectable()
export class UserListLocalDataSourceImpl extends UserListLocalDataSource {
  constructor(private store: TmsMockStore) {
    super();
  }

  getUsers(params: UserListParams): Observable<ListPageResponse<UserListItemModel>> {
    const search = params.search.trim().toLowerCase();
    return of(this.store.listAdminUsers()).pipe(
      delay(120),
      map((rows) => {
        const filtered = rows
          .map((row) => ({
            id: row.id,
            name: row.name,
            group: row.teamName ?? '',
            role: mapApiRole(row.roleId, row.roleName),
            roleName: row.roleName,
            hrCode: row.code,
          }))
          .filter((row) => !search || `${row.name} ${row.hrCode} ${row.group} ${row.roleName}`.toLowerCase().includes(search));
        const skip = (params.page - 1) * params.pageSize;
        return {
          items: filtered.slice(skip, skip + params.pageSize),
          page: params.page,
          pageSize: params.pageSize,
          totalCount: filtered.length,
        };
      }),
    );
  }

  getUser(id: number): Observable<UserDetailModel> {
    const user = this.store.getAdminUser(id);
    if (!user) {
      return throwError(() => new Error('User not found'));
    }
    return of(this.toDetail(user)).pipe(delay(80));
  }

  getUserBalance(id: number): Observable<UserBalanceEntity> {
    const user = this.store.getAdminUser(id);
    if (!user) {
      return throwError(() => new Error('User not found'));
    }
    return of({ ...user.balances }).pipe(delay(80));
  }

  saveUserBalance(payload: UserBalanceUpdate): Observable<UserBalanceEntity> {
    const user = this.store.users.find((row) => row.id === payload.userId && !row.archived);
    if (!user) {
      return throwError(() => new Error('User not found'));
    }
    const current = user.balances;
    if (
      payload.annualUsed > payload.annualMax
      || payload.emergencyUsed > payload.emergencyMax
      || payload.permissionUsed > payload.permissionMax
      || payload.wfhUsed > payload.wfhMax
      || payload.fromNextUsed > current.fromNextMax
    ) {
      return throwError(() => new Error('Used balance cannot be above its maximum.'));
    }
    user.balances = {
      ...current,
      annualUsed: payload.annualUsed,
      annualMax: payload.annualMax,
      sickUsed: payload.sickUsed,
      emergencyUsed: payload.emergencyUsed,
      emergencyMax: payload.emergencyMax,
      permissionUsed: payload.permissionUsed,
      permissionMax: payload.permissionMax,
      wfhUsed: payload.wfhUsed,
      wfhMax: payload.wfhMax,
      fromNextUsed: payload.fromNextUsed,
    };
    return of({ ...user.balances }).pipe(delay(80));
  }

  saveUser(payload: UserFormPayload): Observable<UserDetailModel> {
    const saved = this.store.saveAdminUser(payload);
    if (!saved) {
      return throwError(() => new Error('User not found'));
    }
    return of(this.toDetail(saved)).pipe(delay(120));
  }

  archiveUser(id: number): Observable<void> {
    if (!this.store.archiveAdminUser(id)) {
      return throwError(() => new Error('User not found'));
    }
    return of(undefined).pipe(delay(80));
  }

  getFormOptions(): Observable<UserFormOptionsModel> {
    return of({
      roles: this.store.listRoles().map((row) => ({ id: row.id, name: row.name })),
      teams: this.store.listTeams().map((row) => ({ id: row.id, name: row.name })),
    }).pipe(delay(80));
  }

  private toDetail(user: ReturnType<TmsMockStore['getAdminUser']> & object): UserDetailModel {
    const row = user as NonNullable<ReturnType<TmsMockStore['getAdminUser']>>;
    return {
      id: row.id,
      code: row.code,
      name: row.name,
      hrCode: row.code,
      email: row.email,
      phone: row.phone,
      title: row.title,
      roleId: row.roleId,
      roleName: row.roleName,
      accountType: row.accountType,
      onBoard: true,
      teamId: row.teamId,
      teamName: row.teamName ?? undefined,
    };
  }
}
