import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseUseCase } from '@core/base/usecase/base-usecase';
import { CreateWfhPayload } from '../entity/my-leaves.entity';
import { MyLeavesRepository } from '../repository/my-leaves.repository';

export interface CreateWfhParams {
  userId: number;
  payload: CreateWfhPayload;
}

@Injectable()
export class CreateWfhUseCase implements BaseUseCase<CreateWfhParams, void> {
  constructor(private repository: MyLeavesRepository) {}

  execute(params: CreateWfhParams): Observable<void> {
    return this.repository.createWfh(params.userId, params.payload);
  }
}
