import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseUseCase } from '@core/base/usecase/base-usecase';
import { SprintEntity } from '../entity/sprint-list.entity';
import { SprintListRepository } from '../repository/sprint-list.repository';

export interface ArchiveSprintParams {
  id: number;
  archived: boolean;
}

@Injectable()
export class ArchiveSprintUseCase implements BaseUseCase<ArchiveSprintParams, SprintEntity> {
  constructor(private repository: SprintListRepository) {}

  execute(params: ArchiveSprintParams): Observable<SprintEntity> {
    return this.repository.archiveSprint(params.id, params.archived);
  }
}
