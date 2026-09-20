import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseUseCase, NoParam } from '@core/base/usecase/base-usecase';
import { RoleEntity } from '../entity/role-list.entity';
import { RoleListRepository } from '../repository/role-list.repository';

@Injectable()
export class RoleListUseCase implements BaseUseCase<NoParam, RoleEntity[]> {
  constructor(private repository: RoleListRepository) {}

  execute(): Observable<RoleEntity[]> {
    return this.repository.getRoles();
  }
}
