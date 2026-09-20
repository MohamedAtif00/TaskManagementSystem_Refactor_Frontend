import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseUseCase } from '@core/base/usecase/base-usecase';
import { SchemaListRepository } from '../repository/schema-list.repository';

@Injectable()
export class ArchiveSchemaUseCase implements BaseUseCase<number, void> {
  constructor(private repository: SchemaListRepository) {}

  execute(id: number): Observable<void> {
    return this.repository.archiveSchema(id);
  }
}
