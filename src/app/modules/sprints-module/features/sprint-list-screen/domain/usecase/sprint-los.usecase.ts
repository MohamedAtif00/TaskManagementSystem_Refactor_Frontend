import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseUseCase } from '@core/base/usecase/base-usecase';
import { SprintLoOption } from '../entity/sprint-list.entity';
import { SprintListRepository } from '../repository/sprint-list.repository';

@Injectable()
export class SprintLosUseCase implements BaseUseCase<number, SprintLoOption[]> {
  constructor(private repository: SprintListRepository) {}

  execute(subjectId: number): Observable<SprintLoOption[]> {
    return this.repository.getLos(subjectId);
  }
}
