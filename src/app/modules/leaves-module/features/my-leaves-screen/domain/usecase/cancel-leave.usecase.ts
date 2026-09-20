import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseUseCase } from '@core/base/usecase/base-usecase';
import { CancelRequestPayload } from '../entity/my-leaves.entity';
import { MyLeavesRepository } from '../repository/my-leaves.repository';

export interface CancelLeaveParams {
  userId: number;
  payload: CancelRequestPayload;
}

@Injectable()
export class CancelLeaveUseCase implements BaseUseCase<CancelLeaveParams, void> {
  constructor(private repository: MyLeavesRepository) {}

  execute(params: CancelLeaveParams): Observable<void> {
    return this.repository.cancel(params.userId, params.payload);
  }
}
