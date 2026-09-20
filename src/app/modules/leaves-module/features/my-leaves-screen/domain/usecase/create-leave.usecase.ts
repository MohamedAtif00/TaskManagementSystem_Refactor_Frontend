import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseUseCase } from '@core/base/usecase/base-usecase';
import { CreateLeavePayload } from '../entity/my-leaves.entity';
import { MyLeavesRepository } from '../repository/my-leaves.repository';

export interface CreateLeaveParams {
  userId: number;
  payload: CreateLeavePayload;
}

@Injectable()
export class CreateLeaveUseCase implements BaseUseCase<CreateLeaveParams, void> {
  constructor(private repository: MyLeavesRepository) {}

  execute(params: CreateLeaveParams): Observable<void> {
    return this.repository.createLeave(params.userId, params.payload);
  }
}
