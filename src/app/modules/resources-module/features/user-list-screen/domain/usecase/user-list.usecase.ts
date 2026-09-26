import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseUseCase } from '@core/base/usecase/base-usecase';
import { UserListPageEntity, UserListParams } from '../entity/user-list.entity';
import { UserListRepository } from '../repository/user-list.repository';

@Injectable()
export class UserListUseCase implements BaseUseCase<UserListParams, UserListPageEntity> {
  constructor(private repository: UserListRepository) {}

  execute(params: UserListParams): Observable<UserListPageEntity> {
    return this.repository.getUsers(params);
  }
}
