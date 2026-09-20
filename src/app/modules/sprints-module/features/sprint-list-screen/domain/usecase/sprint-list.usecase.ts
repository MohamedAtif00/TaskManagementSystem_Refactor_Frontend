import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseUseCase } from '@core/base/usecase/base-usecase';
import { SprintEntity, SprintListParams } from '../entity/sprint-list.entity';
import { SprintListRepository } from '../repository/sprint-list.repository';

@Injectable()
export class SprintListUseCase implements BaseUseCase<SprintListParams, SprintEntity[]> {
  constructor(private repository: SprintListRepository) {}

  execute(params: SprintListParams): Observable<SprintEntity[]> {
    return this.repository.getSprints(params);
  }
}
