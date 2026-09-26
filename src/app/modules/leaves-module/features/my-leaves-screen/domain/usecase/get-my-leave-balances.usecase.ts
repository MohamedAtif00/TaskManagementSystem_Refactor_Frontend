import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseUseCase } from '@core/base/usecase/base-usecase';
import { LeaveBalanceEntity } from '../entity/my-leaves.entity';
import { MyLeavesRepository } from '../repository/my-leaves.repository';

@Injectable()
export class GetMyLeaveBalancesUseCase implements BaseUseCase<number, LeaveBalanceEntity> {
  constructor(private repository: MyLeavesRepository) {}

  execute(userId: number): Observable<LeaveBalanceEntity> {
    return this.repository.getBalances(userId);
  }
}
