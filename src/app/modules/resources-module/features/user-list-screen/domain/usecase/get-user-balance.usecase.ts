import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseUseCase } from '@core/base/usecase/base-usecase';
import { UserBalanceEntity } from '../entity/user-list.entity';
import { UserListRepository } from '../repository/user-list.repository';

@Injectable()
export class GetUserBalanceUseCase implements BaseUseCase<number, UserBalanceEntity> {
  constructor(private repository: UserListRepository) {}

  execute(id: number): Observable<UserBalanceEntity> {
    return this.repository.getUserBalance(id);
  }
}
