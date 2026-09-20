import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { RoleEntity, RoleFormPayload, RolePermissionOption } from '../../domain/entity/role-list.entity';
import { RoleListRepository } from '../../domain/repository/role-list.repository';
import { RoleListLocalDataSource } from '../data_source/local/role-list-local-datasource';
import { RoleListRemoteDataSource } from '../data_source/remote/role-list-remote-datasource';
import { RoleListMapper } from '../model/role-list.model';

@Injectable()
export class RoleListImplementationRepository implements RoleListRepository {
  constructor(
    private local: RoleListLocalDataSource,
    private remote: RoleListRemoteDataSource,
  ) {}

  getRoles(): Observable<RoleEntity[]> {
    const source = environment.useMock ? this.local.getRoles() : this.remote.getRoles();
    return source.pipe(map((rows) => rows.map((row) => RoleListMapper.toEntity(row))));
  }

  getPermissions(): Observable<RolePermissionOption[]> {
    return environment.useMock ? this.local.getPermissions() : this.remote.getPermissions();
  }

  saveRole(payload: RoleFormPayload): Observable<RoleEntity> {
    const source = environment.useMock ? this.local.saveRole(payload) : this.remote.saveRole(payload);
    return source.pipe(map((row) => RoleListMapper.toEntity(row)));
  }

  deleteRole(id: number): Observable<void> {
    return environment.useMock ? this.local.deleteRole(id) : this.remote.deleteRole(id);
  }
}
