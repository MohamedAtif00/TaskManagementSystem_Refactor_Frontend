import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseUseCase } from '@core/base/usecase/base-usecase';
import { ProjectListParams, ProjectRootEntity } from '../entity/project-list.entity';
import { ProjectListRepository } from '../repository/project-list.repository';

@Injectable()
export class ProjectListUseCase implements BaseUseCase<ProjectListParams, ProjectRootEntity[]> {
  constructor(private repository: ProjectListRepository) {}

  execute(params: ProjectListParams): Observable<ProjectRootEntity[]> {
    return this.repository.getProjects(params);
  }
}
