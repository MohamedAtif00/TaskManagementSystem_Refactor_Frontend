import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseUseCase, NoParam } from '@core/base/usecase/base-usecase';
import { CurriculumNode } from '../entity/curriculum-admin.entity';
import { CurriculumAdminRepository } from '../repository/curriculum-admin.repository';

@Injectable()
export class GetCurriculumTreeUseCase implements BaseUseCase<NoParam, CurriculumNode[]> {
  constructor(private repository: CurriculumAdminRepository) {}

  execute(): Observable<CurriculumNode[]> {
    return this.repository.getTree();
  }
}
