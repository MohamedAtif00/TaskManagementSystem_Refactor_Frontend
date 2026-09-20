import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseUseCase } from '@core/base/usecase/base-usecase';
import { ArchiveCurriculumPayload } from '../entity/curriculum-admin.entity';
import { CurriculumAdminRepository } from '../repository/curriculum-admin.repository';

@Injectable()
export class ArchiveCurriculumNodeUseCase implements BaseUseCase<ArchiveCurriculumPayload, void> {
  constructor(private repository: CurriculumAdminRepository) {}

  execute(payload: ArchiveCurriculumPayload): Observable<void> {
    return this.repository.archive(payload);
  }
}
