import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseUseCase, NoParam } from '@core/base/usecase/base-usecase';
import { UserFormOptions } from '../entity/user-list.entity';
import { UserListRepository } from '../repository/user-list.repository';

@Injectable()
export class UserFormOptionsUseCase implements BaseUseCase<NoParam, UserFormOptions> {
  constructor(private repository: UserListRepository) {}

  execute(): Observable<UserFormOptions> {
    return this.repository.getFormOptions();
  }
}
