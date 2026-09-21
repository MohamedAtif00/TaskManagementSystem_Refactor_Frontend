import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseUseCase } from '@core/base/usecase/base-usecase';
import { ProjectRootEntity } from '../entity/project-list.entity';
import { ProjectListRepository } from '../repository/project-list.repository';

@Injectable()
export class GetProjectUseCase implements BaseUseCase<number, ProjectRootEntity> {
  constructor(private repository: ProjectListRepository) {}

  execute(id: number): Observable<ProjectRootEntity> {
    return this.repository.getProject(id);
  }
}
