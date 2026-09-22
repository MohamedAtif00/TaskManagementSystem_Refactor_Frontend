import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseUseCase } from '@core/base/usecase/base-usecase';
import { TaskActivity } from '../entity/task-board.entity';
import { TaskBoardRepository } from '../repository/task-board.repository';

@Injectable()
export class ListActivityUseCase implements BaseUseCase<number, TaskActivity[]> {
  constructor(private repository: TaskBoardRepository) {}

  execute(ticketId: number): Observable<TaskActivity[]> {
    return this.repository.listActivity(ticketId);
  }
}
