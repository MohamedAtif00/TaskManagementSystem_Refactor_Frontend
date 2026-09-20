import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseUseCase, NoParam } from '@core/base/usecase/base-usecase';
import { SchemaTaskBankOption } from '../entity/schema-list.entity';
import { SchemaListRepository } from '../repository/schema-list.repository';

@Injectable()
export class SchemaTaskBankUseCase implements BaseUseCase<NoParam, SchemaTaskBankOption[]> {
  constructor(private repository: SchemaListRepository) {}

  execute(): Observable<SchemaTaskBankOption[]> {
    return this.repository.listTaskBank();
  }
}
