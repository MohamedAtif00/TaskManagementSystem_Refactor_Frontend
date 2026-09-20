import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseUseCase, NoParam } from '@core/base/usecase/base-usecase';
import { SectionEntity } from '../entity/section-list.entity';
import { SectionListRepository } from '../repository/section-list.repository';

@Injectable()
export class SectionListUseCase implements BaseUseCase<NoParam, SectionEntity[]> {
  constructor(private repository: SectionListRepository) {}

  execute(): Observable<SectionEntity[]> {
    return this.repository.getSections();
  }
}
