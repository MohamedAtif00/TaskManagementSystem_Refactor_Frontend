import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseUseCase } from '@core/base/usecase/base-usecase';
import { ProjectFormPayload, ProjectRootEntity } from '../entity/project-list.entity';
import { ProjectListRepository } from '../repository/project-list.repository';

@Injectable()
export class SaveProjectUseCase implements BaseUseCase<ProjectFormPayload, ProjectRootEntity> {
  constructor(private repository: ProjectListRepository) {}

  execute(payload: ProjectFormPayload): Observable<ProjectRootEntity> {
    return this.repository.saveProject(payload);
  }
}
