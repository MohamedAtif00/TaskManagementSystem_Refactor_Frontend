import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseUseCase } from '@core/base/usecase/base-usecase';
import { UserDetailEntity } from '../entity/user-list.entity';
import { UserListRepository } from '../repository/user-list.repository';

@Injectable()
export class GetUserUseCase implements BaseUseCase<number, UserDetailEntity> {
  constructor(private repository: UserListRepository) {}

  execute(id: number): Observable<UserDetailEntity> {
    return this.repository.getUser(id);
  }
}
