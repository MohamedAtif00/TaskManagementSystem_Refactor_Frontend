import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseUseCase, NoParam } from '@core/base/usecase/base-usecase';
import { SectionFormOptions } from '../entity/section-list.entity';
import { SectionListRepository } from '../repository/section-list.repository';

@Injectable()
export class SectionFormOptionsUseCase implements BaseUseCase<NoParam, SectionFormOptions> {
  constructor(private repository: SectionListRepository) {}

  execute(): Observable<SectionFormOptions> {
    return this.repository.getFormOptions();
  }
}
