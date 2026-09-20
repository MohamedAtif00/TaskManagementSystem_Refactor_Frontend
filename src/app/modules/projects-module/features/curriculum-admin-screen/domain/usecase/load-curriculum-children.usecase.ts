import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseUseCase } from '@core/base/usecase/base-usecase';
import { CurriculumNode } from '../entity/curriculum-admin.entity';
import { CurriculumAdminRepository } from '../repository/curriculum-admin.repository';

@Injectable()
export class LoadCurriculumChildrenUseCase implements BaseUseCase<CurriculumNode, CurriculumNode[]> {
  constructor(private repository: CurriculumAdminRepository) {}

  execute(node: CurriculumNode): Observable<CurriculumNode[]> {
    return this.repository.loadChildren(node);
  }
}
