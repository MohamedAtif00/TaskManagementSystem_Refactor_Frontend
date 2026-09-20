import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { TmsMockStore } from '@core/mock/tms-mock.store';
import { RoleFormPayload } from '../../../domain/entity/role-list.entity';
import { RoleModel, RolePermissionModel } from '../../model/role-list.model';
import { RoleListLocalDataSource } from './role-list-local-datasource';

@Injectable()
export class RoleListLocalDataSourceImpl extends RoleListLocalDataSource {
  constructor(private store: TmsMockStore) {
    super();
  }

  getRoles(): Observable<RoleModel[]> {
    return of(this.store.listRoles().map((row) => this.toModel(row))).pipe(delay(80));
  }

  getPermissions(): Observable<RolePermissionModel[]> {
    return of(this.store.permissions.map((row) => ({ id: row.id, code: row.code, name: row.name }))).pipe(delay(80));
  }

  saveRole(payload: RoleFormPayload): Observable<RoleModel> {
    try {
      const saved = this.store.saveRole(payload);
      if (!saved) {
        return throwError(() => new Error('Role not found'));
      }
      return of(this.toModel(saved)).pipe(delay(80));
    } catch (err) {
      return throwError(() => (err instanceof Error ? err : new Error('Save failed')));
    }
  }

  deleteRole(id: number): Observable<void> {
    try {
      if (!this.store.deleteRole(id)) {
        return throwError(() => new Error('Role not found'));
      }
      return of(undefined).pipe(delay(80));
    } catch (err) {
      return throwError(() => (err instanceof Error ? err : new Error('Delete failed')));
    }
  }

  private toModel(row: ReturnType<TmsMockStore['listRoles']>[number]): RoleModel {
    return {
      id: row.id,
      name: row.name,
      description: row.description ?? '',
      isSystem: row.isSystem,
      permissionCount: row.permissionCodes.length,
      permissionCodes: row.permissionCodes,
    };
  }
}
