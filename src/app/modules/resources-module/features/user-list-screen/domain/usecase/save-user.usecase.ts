import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseUseCase } from '@core/base/usecase/base-usecase';
import { UserDetailEntity, UserFormPayload } from '../entity/user-list.entity';
import { UserListRepository } from '../repository/user-list.repository';

@Injectable()
export class SaveUserUseCase implements BaseUseCase<UserFormPayload, UserDetailEntity> {
  constructor(private repository: UserListRepository) {}

  execute(payload: UserFormPayload): Observable<UserDetailEntity> {
    return this.repository.saveUser(payload);
  }
}
