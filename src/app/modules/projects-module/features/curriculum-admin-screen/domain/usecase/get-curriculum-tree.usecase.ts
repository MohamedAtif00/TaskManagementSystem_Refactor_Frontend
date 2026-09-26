import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseUseCase } from '@core/base/usecase/base-usecase';
import { CurriculumStatusTab } from '@core/models/curriculum-status-tab';
import { CurriculumNode } from '../entity/curriculum-admin.entity';
import { CurriculumAdminRepository } from '../repository/curriculum-admin.repository';

export interface GetCurriculumTreeParams {
  statusTab: CurriculumStatusTab;
}

@Injectable()
export class GetCurriculumTreeUseCase implements BaseUseCase<GetCurriculumTreeParams, CurriculumNode[]> {
  constructor(private repository: CurriculumAdminRepository) {}

  execute(params: GetCurriculumTreeParams): Observable<CurriculumNode[]> {
    return this.repository.getTree(params.statusTab);
  }
}
