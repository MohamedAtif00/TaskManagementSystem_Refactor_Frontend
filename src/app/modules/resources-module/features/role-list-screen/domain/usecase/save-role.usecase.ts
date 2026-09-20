import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseUseCase } from '@core/base/usecase/base-usecase';
import { RoleEntity, RoleFormPayload } from '../entity/role-list.entity';
import { RoleListRepository } from '../repository/role-list.repository';

@Injectable()
export class SaveRoleUseCase implements BaseUseCase<RoleFormPayload, RoleEntity> {
  constructor(private repository: RoleListRepository) {}

  execute(payload: RoleFormPayload): Observable<RoleEntity> {
    return this.repository.saveRole(payload);
  }
}
