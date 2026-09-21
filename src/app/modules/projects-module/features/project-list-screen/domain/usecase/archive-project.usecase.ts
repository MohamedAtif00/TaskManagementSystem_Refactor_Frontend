import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseUseCase } from '@core/base/usecase/base-usecase';
import { ProjectListRepository } from '../repository/project-list.repository';

@Injectable()
export class ArchiveProjectUseCase implements BaseUseCase<number, void> {
  constructor(private repository: ProjectListRepository) {}

  execute(id: number): Observable<void> {
    return this.repository.archiveProject(id);
  }
}
