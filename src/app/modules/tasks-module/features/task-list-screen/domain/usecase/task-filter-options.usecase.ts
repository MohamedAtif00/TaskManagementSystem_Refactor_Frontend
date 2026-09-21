import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseUseCase } from '@core/base/usecase/base-usecase';
import { TaskFilterOptions } from '../entity/task-list.entity';
import { TaskListRepository } from '../repository/task-list.repository';

@Injectable()
export class TaskFilterOptionsUseCase implements BaseUseCase<void, TaskFilterOptions> {
  constructor(private repository: TaskListRepository) {}

  execute(): Observable<TaskFilterOptions> {
    return this.repository.getFilterOptions();
  }
}
