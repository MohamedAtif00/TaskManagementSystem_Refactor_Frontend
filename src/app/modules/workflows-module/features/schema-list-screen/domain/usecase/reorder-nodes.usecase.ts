import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseUseCase } from '@core/base/usecase/base-usecase';
import { SchemaListRepository } from '../repository/schema-list.repository';

export interface ReorderNodesPayload {
  schemaId: number;
  orderedNodeIds: number[];
}

@Injectable()
export class ReorderNodesUseCase implements BaseUseCase<ReorderNodesPayload, void> {
  constructor(private repository: SchemaListRepository) {}

  execute(payload: ReorderNodesPayload): Observable<void> {
    return this.repository.reorderNodes(payload.schemaId, payload.orderedNodeIds);
  }
}
