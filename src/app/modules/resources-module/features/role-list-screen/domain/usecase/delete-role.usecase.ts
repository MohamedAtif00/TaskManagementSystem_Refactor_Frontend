import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseUseCase } from '@core/base/usecase/base-usecase';
import { RoleListRepository } from '../repository/role-list.repository';

@Injectable()
export class DeleteRoleUseCase implements BaseUseCase<number, void> {
  constructor(private repository: RoleListRepository) {}

  execute(id: number): Observable<void> {
    return this.repository.deleteRole(id);
  }
}
