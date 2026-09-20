import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseUseCase } from '@core/base/usecase/base-usecase';
import { SchemaNode } from '../entity/schema-list.entity';
import { SchemaListRepository } from '../repository/schema-list.repository';

@Injectable()
export class SchemaGraphUseCase implements BaseUseCase<number, SchemaNode[]> {
  constructor(private repository: SchemaListRepository) {}

  execute(schemaId: number): Observable<SchemaNode[]> {
    return this.repository.getGraph(schemaId);
  }
}
