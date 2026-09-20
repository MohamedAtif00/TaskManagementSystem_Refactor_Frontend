import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseUseCase } from '@core/base/usecase/base-usecase';
import { SprintEntity, SprintFormPayload } from '../entity/sprint-list.entity';
import { SprintListRepository } from '../repository/sprint-list.repository';

@Injectable()
export class SaveSprintUseCase implements BaseUseCase<SprintFormPayload, SprintEntity> {
  constructor(private repository: SprintListRepository) {}

  execute(params: SprintFormPayload): Observable<SprintEntity> {
    return this.repository.saveSprint(params);
  }
}
