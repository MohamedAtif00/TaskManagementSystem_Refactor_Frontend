import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseUseCase } from '@core/base/usecase/base-usecase';
import { SaveCurriculumPayload } from '../entity/curriculum-admin.entity';
import { CurriculumAdminRepository } from '../repository/curriculum-admin.repository';

@Injectable()
export class SaveCurriculumNodeUseCase implements BaseUseCase<SaveCurriculumPayload, void> {
  constructor(private repository: CurriculumAdminRepository) {}

  execute(payload: SaveCurriculumPayload): Observable<void> {
    return this.repository.save(payload);
  }
}
