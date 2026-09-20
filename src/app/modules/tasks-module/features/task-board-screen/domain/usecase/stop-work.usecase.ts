import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseUseCase } from '@core/base/usecase/base-usecase';
import { TaskWorkTime } from '../entity/task-board.entity';
import { TaskBoardRepository } from '../repository/task-board.repository';

@Injectable()
export class StopWorkUseCase implements BaseUseCase<number, TaskWorkTime> {
  constructor(private repository: TaskBoardRepository) {}

  execute(ticketId: number): Observable<TaskWorkTime> {
    return this.repository.stopWork(ticketId);
  }
}
