import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseUseCase } from '@core/base/usecase/base-usecase';
import { CreatePermissionPayload } from '../entity/my-leaves.entity';
import { MyLeavesRepository } from '../repository/my-leaves.repository';

export interface CreatePermissionParams {
  userId: number;
  payload: CreatePermissionPayload;
}

@Injectable()
export class CreatePermissionUseCase implements BaseUseCase<CreatePermissionParams, void> {
  constructor(private repository: MyLeavesRepository) {}

  execute(params: CreatePermissionParams): Observable<void> {
    return this.repository.createPermission(params.userId, params.payload);
  }
}
