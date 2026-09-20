import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { API, apiPath } from '@core/network/api/api.const';
import { mapHttpError } from '@core/network/http-error';
import { NetworkService } from '@core/network/network.service';
import { CatalogRole, RoleCatalogService } from '@core/network/role-catalog.service';
import { RoleFormPayload } from '../../../domain/entity/role-list.entity';
import { RoleModel, RolePermissionModel } from '../../model/role-list.model';
import { RoleListRemoteDataSource } from './role-list-remote-datasource';

@Injectable()
export class RoleListRemoteDataSourceImpl extends RoleListRemoteDataSource {
  constructor(
    private network: NetworkService,
    private catalog: RoleCatalogService,
  ) {
    super();
  }

  getRoles(): Observable<RoleModel[]> {
    return this.catalog.refreshRoles().pipe(map((rows) => rows.map((row) => this.toModel(row))));
  }

  getPermissions(): Observable<RolePermissionModel[]> {
    return this.catalog.refreshPermissions().pipe(
      map((rows) => rows.map((row) => ({ id: row.id, code: row.code, name: row.name }))),
    );
  }

  saveRole(payload: RoleFormPayload): Observable<RoleModel> {
    const body = { name: payload.name, description: payload.description || null, permissionIds: payload.permissionIds };
    if (payload.id == null) {
      return this.network.post<CatalogRole>(API.Roles.Create, body).pipe(
        switchMap((created) => this.catalog.refreshRoles().pipe(map((rows) => this.toModel(rows.find((row) => row.id === created.id) ?? created)))),
        catchError(mapHttpError),
      );
    }
    const roleId = payload.id;
    return this.network.put<CatalogRole>(apiPath(API.Roles.Update, { id: roleId }), { name: payload.name, description: payload.description || null }).pipe(
      switchMap((role) =>
        this.network.put(apiPath(API.Roles.Permissions, { id: roleId }), { permissionIds: payload.permissionIds }).pipe(map(() => role)),
      ),
      switchMap(() => this.catalog.refreshRoles()),
      map((rows) => this.toModel(rows.find((row) => row.id === roleId)!)),
      catchError(mapHttpError),
    );
  }

  deleteRole(id: number): Observable<void> {
    return this.network.delete(apiPath(API.Roles.Archive, { id })).pipe(
      switchMap(() => this.catalog.refreshRoles().pipe(map(() => undefined))),
      catchError(mapHttpError),
    );
  }

  private toModel(row: CatalogRole): RoleModel {
    return {
      id: row.id,
      name: row.name,
      description: row.description ?? '',
      isSystem: row.isSystem,
      permissionCount: row.permissionCodes?.length ?? 0,
      permissionCodes: row.permissionCodes ?? [],
    };
  }
}
