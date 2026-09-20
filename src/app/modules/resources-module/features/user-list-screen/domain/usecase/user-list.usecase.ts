import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseUseCase } from '@core/base/usecase/base-usecase';
import { UserListItemEntity, UserListParams } from '../entity/user-list.entity';
import { UserListRepository } from '../repository/user-list.repository';

@Injectable()
export class UserListUseCase implements BaseUseCase<UserListParams, UserListItemEntity[]> {
  constructor(private repository: UserListRepository) {}

  execute(params: UserListParams): Observable<UserListItemEntity[]> {
    return this.repository.getUsers(params);
  }
}
