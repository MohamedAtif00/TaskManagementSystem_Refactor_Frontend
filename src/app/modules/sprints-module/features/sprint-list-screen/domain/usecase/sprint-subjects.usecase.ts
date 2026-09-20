import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseUseCase, NoParam } from '@core/base/usecase/base-usecase';
import { SprintSubjectOption } from '../entity/sprint-list.entity';
import { SprintListRepository } from '../repository/sprint-list.repository';

@Injectable()
export class SprintSubjectsUseCase implements BaseUseCase<NoParam, SprintSubjectOption[]> {
  constructor(private repository: SprintListRepository) {}

  execute(_params: NoParam): Observable<SprintSubjectOption[]> {
    return this.repository.getSubjects();
  }
}
