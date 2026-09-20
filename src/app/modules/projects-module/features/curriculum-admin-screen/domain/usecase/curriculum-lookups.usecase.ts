import { Injectable } from '@angular/core';
import { Observable, forkJoin } from 'rxjs';
import { BaseUseCase, NoParam } from '@core/base/usecase/base-usecase';
import { CurriculumSchemaOption, CurriculumUserOption } from '../entity/curriculum-admin.entity';
import { CurriculumAdminRepository } from '../repository/curriculum-admin.repository';

export interface CurriculumFormLookups {
  schemas: CurriculumSchemaOption[];
  users: CurriculumUserOption[];
}

@Injectable()
export class CurriculumLookupsUseCase implements BaseUseCase<NoParam, CurriculumFormLookups> {
  constructor(private repository: CurriculumAdminRepository) {}

  execute(): Observable<CurriculumFormLookups> {
    return forkJoin({
      schemas: this.repository.listSchemas(),
      users: this.repository.listUsers(),
    });
  }
}
