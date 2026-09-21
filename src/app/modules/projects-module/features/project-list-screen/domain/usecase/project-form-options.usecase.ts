import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseUseCase } from '@core/base/usecase/base-usecase';
import { ProjectFormOptions } from '../entity/project-list.entity';
import { ProjectListRepository } from '../repository/project-list.repository';

@Injectable()
export class ProjectFormOptionsUseCase implements BaseUseCase<void, ProjectFormOptions> {
  constructor(private repository: ProjectListRepository) {}

  execute(): Observable<ProjectFormOptions> {
    return this.repository.getFormOptions();
  }
}
