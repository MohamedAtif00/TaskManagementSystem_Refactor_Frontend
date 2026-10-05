import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseUseCase } from '@core/base/usecase/base-usecase';
import { UserBalanceEntity, UserBalanceUpdate } from '../entity/user-list.entity';
import { UserListRepository } from '../repository/user-list.repository';

@Injectable()
export class SaveUserBalanceUseCase implements BaseUseCase<UserBalanceUpdate, UserBalanceEntity> {
  constructor(private repository: UserListRepository) {}

  execute(payload: UserBalanceUpdate): Observable<UserBalanceEntity> {
    return this.repository.saveUserBalance(payload);
  }
}
