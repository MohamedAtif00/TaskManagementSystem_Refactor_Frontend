import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseUseCase, NoParam } from '@core/base/usecase/base-usecase';
import { RolePermissionOption } from '../entity/role-list.entity';
import { RoleListRepository } from '../repository/role-list.repository';

@Injectable()
export class RolePermissionsUseCase implements BaseUseCase<NoParam, RolePermissionOption[]> {
  constructor(private repository: RoleListRepository) {}

  execute(): Observable<RolePermissionOption[]> {
    return this.repository.getPermissions();
  }
}
