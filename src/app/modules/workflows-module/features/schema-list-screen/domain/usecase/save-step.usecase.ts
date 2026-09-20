import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseUseCase } from '@core/base/usecase/base-usecase';
import { StepFormPayload } from '../entity/schema-list.entity';
import { SchemaListRepository } from '../repository/schema-list.repository';

@Injectable()
export class SaveStepUseCase implements BaseUseCase<StepFormPayload, void> {
  constructor(private repository: SchemaListRepository) {}

  execute(payload: StepFormPayload): Observable<void> {
    return this.repository.saveStep(payload);
  }
}
