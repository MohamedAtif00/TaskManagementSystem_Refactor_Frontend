import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseUseCase } from '@core/base/usecase/base-usecase';
import { SectionListRepository } from '../repository/section-list.repository';

@Injectable()
export class ArchiveSectionUseCase implements BaseUseCase<number, void> {
  constructor(private repository: SectionListRepository) {}

  execute(id: number): Observable<void> {
    return this.repository.archiveSection(id);
  }
}
