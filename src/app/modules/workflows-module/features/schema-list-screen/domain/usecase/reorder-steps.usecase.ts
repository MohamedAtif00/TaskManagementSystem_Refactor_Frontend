import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseUseCase } from '@core/base/usecase/base-usecase';
import { SchemaListRepository } from '../repository/schema-list.repository';

export interface ReorderStepsPayload {
  nodeId: number;
  orderedStepIds: number[];
}

@Injectable()
export class ReorderStepsUseCase implements BaseUseCase<ReorderStepsPayload, void> {
  constructor(private repository: SchemaListRepository) {}

  execute(payload: ReorderStepsPayload): Observable<void> {
    return this.repository.reorderSteps(payload.nodeId, payload.orderedStepIds);
  }
}
