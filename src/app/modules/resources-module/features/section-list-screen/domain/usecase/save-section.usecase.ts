import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseUseCase } from '@core/base/usecase/base-usecase';
import { SectionEntity, SectionFormPayload } from '../entity/section-list.entity';
import { SectionListRepository } from '../repository/section-list.repository';

@Injectable()
export class SaveSectionUseCase implements BaseUseCase<SectionFormPayload, SectionEntity> {
  constructor(private repository: SectionListRepository) {}

  execute(payload: SectionFormPayload): Observable<SectionEntity> {
    return this.repository.saveSection(payload);
  }
}
