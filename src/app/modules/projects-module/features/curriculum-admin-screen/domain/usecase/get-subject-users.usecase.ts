import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseUseCase } from '@core/base/usecase/base-usecase';
import { CurriculumAdminRepository } from '../repository/curriculum-admin.repository';

@Injectable()
export class GetSubjectUsersUseCase implements BaseUseCase<number, number[]> {
  constructor(private repository: CurriculumAdminRepository) {}

  execute(subjectId: number): Observable<number[]> {
    return this.repository.getSubjectUsers(subjectId);
  }
}
