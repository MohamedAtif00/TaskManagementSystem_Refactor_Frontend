import { Injectable } from '@angular/core';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseUseCase } from '@core/base/usecase/base-usecase';
import { API, apiPath } from '@core/network/api/api.const';
import { NetworkService } from '@core/network/network.service';
import { CurriculumNode } from '../../../curriculum-admin-screen/domain/entity/curriculum-admin.entity';
import { LoadCurriculumChildrenUseCase } from '../../../curriculum-admin-screen/domain/usecase/load-curriculum-children.usecase';
import { SubjectFocusEntity } from '../entity/subject-focus.entity';

interface SubjectDto {
  id: number;
  name: string;
  description?: string;
  status?: number;
}

@Injectable()
export class GetSubjectFocusUseCase implements BaseUseCase<number, SubjectFocusEntity> {
  constructor(
    private network: NetworkService,
    private childrenUseCase: LoadCurriculumChildrenUseCase,
  ) {}

  execute(subjectId: number): Observable<SubjectFocusEntity> {
    const subjectNode: CurriculumNode = {
      key: `subject-${subjectId}`,
      id: subjectId,
      kind: 'subject',
      name: '',
      children: [],
    };
    return forkJoin({
      subject: this.network.get<SubjectDto>(apiPath(API.Curriculum.Subject, { id: subjectId })),
      units: this.childrenUseCase.execute(subjectNode),
    }).pipe(
      map(({ subject, units }) => ({
        id: subject.id,
        name: subject.name,
        description: subject.description,
        status: subject.status,
        units,
      })),
    );
  }
}
