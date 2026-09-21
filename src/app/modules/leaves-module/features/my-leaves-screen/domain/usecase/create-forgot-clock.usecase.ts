import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseUseCase } from '@core/base/usecase/base-usecase';
import { CreateForgotClockPayload } from '../entity/my-leaves.entity';
import { MyLeavesRepository } from '../repository/my-leaves.repository';

export interface CreateForgotClockParams {
  userId: number;
  payload: CreateForgotClockPayload;
}

@Injectable()
export class CreateForgotClockUseCase implements BaseUseCase<CreateForgotClockParams, void> {
  constructor(private repository: MyLeavesRepository) {}

  execute(params: CreateForgotClockParams): Observable<void> {
    return this.repository.createForgotClock(params.userId, params.payload);
  }
}
