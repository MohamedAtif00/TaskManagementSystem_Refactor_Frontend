import { Injectable } from '@angular/core';
import { Observable, forkJoin } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { mapApiRole } from '@core/models/role-map';
import { API, apiPath } from '@core/network/api/api.const';
import { mapHttpError } from '@core/network/http-error';
import { NetworkService } from '@core/network/network.service';
import { OrganizationCatalogService } from '@core/network/organization-catalog.service';
import { RoleCatalogService } from '@core/network/role-catalog.service';
import { UserDirectoryService } from '@core/network/user-directory.service';
import { UserFormPayload, UserListParams } from '../../../domain/entity/user-list.entity';
import { UserDetailModel, UserFormOptionsModel, UserListItemModel } from '../../model/user-list.model';
import { UserListRemoteDataSource } from './user-list-remote-datasource';

interface UserDetailDto {
  id: number;
  code: string;
  name: string;
  hrCode: string;
  email?: string;
  phone?: string;
  title?: string;
  roleId: number;
  roleName: string;
  accountType: number;
  teamId?: number | null;
  teamName?: string;
}

@Injectable()
export class UserListRemoteDataSourceImpl extends UserListRemoteDataSource {
  constructor(
    private network: NetworkService,
    private users: UserDirectoryService,
    private roles: RoleCatalogService,
    private organization: OrganizationCatalogService,
  ) {
    super();
  }

  getUsers(params: UserListParams): Observable<UserListItemModel[]> {
    const search = params.search.trim().toLowerCase();
    return this.users.refresh().pipe(
      map((rows) =>
        rows
          .map((row) => ({
            id: row.id,
            name: row.name,
            group: row.teamName ?? '',
            role: mapApiRole(row.roleId, row.roleName),
            roleName: row.roleName,
            hrCode: row.hrCode || row.code,
          }))
          .filter((row) => !search || `${row.name} ${row.hrCode} ${row.group} ${row.roleName}`.toLowerCase().includes(search)),
      ),
    );
  }

  getUser(id: number): Observable<UserDetailModel> {
    return this.network.get<UserDetailDto>(apiPath(API.Users.ById, { id })).pipe(
      map((row) => this.toDetail(row)),
      catchError(mapHttpError),
    );
  }

  saveUser(payload: UserFormPayload): Observable<UserDetailModel> {
    const body = {
      name: payload.name,
      hrCode: payload.hrCode,
      email: payload.email || null,
      phone: payload.phone || null,
      title: payload.title || null,
      roleId: payload.roleId,
      accountType: payload.accountType,
      teamId: payload.teamId || null,
    };
    const request$ = payload.id
      ? this.network.put<UserDetailDto>(apiPath(API.Users.Update, { id: payload.id }), body)
      : this.network.post<UserDetailDto>(API.Users.Create, body);
    return request$.pipe(
      switchMap((row) => this.users.refresh().pipe(map(() => this.toDetail(row)))),
      catchError(mapHttpError),
    );
  }

  archiveUser(id: number): Observable<void> {
    return this.network.delete(apiPath(API.Users.Archive, { id })).pipe(
      switchMap(() => this.users.refresh().pipe(map(() => undefined))),
      catchError(mapHttpError),
    );
  }

  getFormOptions(): Observable<UserFormOptionsModel> {
    return forkJoin({
      roles: this.roles.refreshRoles(),
      teams: this.organization.refreshTeams(),
    }).pipe(
      map(({ roles, teams }) => ({
        roles: roles.map((row) => ({ id: row.id, name: row.name })),
        teams: teams.map((row) => ({ id: row.id, name: row.name })),
      })),
    );
  }

  private toDetail(row: UserDetailDto): UserDetailModel {
    return {
      id: row.id,
      name: row.name,
      hrCode: row.hrCode || row.code,
      email: row.email,
      phone: row.phone,
      title: row.title,
      roleId: row.roleId,
      roleName: row.roleName,
      accountType: row.accountType,
      teamId: row.teamId,
      teamName: row.teamName,
    };
  }
}
