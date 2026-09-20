import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseUseCase } from '@core/base/usecase/base-usecase';
import { NodeFormPayload } from '../entity/schema-list.entity';
import { SchemaListRepository } from '../repository/schema-list.repository';

@Injectable()
export class SaveNodeUseCase implements BaseUseCase<NodeFormPayload, void> {
  constructor(private repository: SchemaListRepository) {}

  execute(payload: NodeFormPayload): Observable<void> {
    return this.repository.saveNode(payload);
  }
}
