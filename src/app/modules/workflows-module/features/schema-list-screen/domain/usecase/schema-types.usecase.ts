import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseUseCase, NoParam } from '@core/base/usecase/base-usecase';
import { SchemaTypeOption } from '../entity/schema-list.entity';
import { SchemaListRepository } from '../repository/schema-list.repository';

@Injectable()
export class SchemaTypesUseCase implements BaseUseCase<NoParam, SchemaTypeOption[]> {
  constructor(private repository: SchemaListRepository) {}

  execute(): Observable<SchemaTypeOption[]> {
    return this.repository.listTypes();
  }
}
