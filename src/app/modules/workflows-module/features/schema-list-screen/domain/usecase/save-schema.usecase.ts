import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseUseCase } from '@core/base/usecase/base-usecase';
import { SchemaEntity, SchemaFormPayload } from '../entity/schema-list.entity';
import { SchemaListRepository } from '../repository/schema-list.repository';

@Injectable()
export class SaveSchemaUseCase implements BaseUseCase<SchemaFormPayload, SchemaEntity> {
  constructor(private repository: SchemaListRepository) {}

  execute(payload: SchemaFormPayload): Observable<SchemaEntity> {
    return this.repository.saveSchema(payload);
  }
}
