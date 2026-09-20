import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseUseCase } from '@core/base/usecase/base-usecase';
import { TaskComment } from '../entity/task-board.entity';
import { TaskBoardRepository } from '../repository/task-board.repository';

@Injectable()
export class ListCommentsUseCase implements BaseUseCase<number, TaskComment[]> {
  constructor(private repository: TaskBoardRepository) {}

  execute(ticketId: number): Observable<TaskComment[]> {
    return this.repository.listComments(ticketId);
  }
}
