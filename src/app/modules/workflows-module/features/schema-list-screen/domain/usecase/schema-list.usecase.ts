import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseUseCase, NoParam } from '@core/base/usecase/base-usecase';
import { SchemaEntity } from '../entity/schema-list.entity';
import { SchemaListRepository } from '../repository/schema-list.repository';

@Injectable()
export class SchemaListUseCase implements BaseUseCase<NoParam, SchemaEntity[]> {
  constructor(private repository: SchemaListRepository) {}

  execute(): Observable<SchemaEntity[]> {
    return this.repository.getSchemas();
  }
}
