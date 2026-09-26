import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseUseCase } from '@core/base/usecase/base-usecase';
import { SprintListPageEntity, SprintListParams } from '../entity/sprint-list.entity';
import { SprintListRepository } from '../repository/sprint-list.repository';

@Injectable()
export class SprintListUseCase implements BaseUseCase<SprintListParams, SprintListPageEntity> {
  constructor(private repository: SprintListRepository) {}

  execute(params: SprintListParams): Observable<SprintListPageEntity> {
    return this.repository.getSprints(params);
  }
}
