import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseUseCase } from '@core/base/usecase/base-usecase';
import { JumpTaskPayload, TaskCardEntity } from '../entity/task-board.entity';
import { TaskBoardRepository } from '../repository/task-board.repository';

@Injectable()
export class JumpTaskUseCase implements BaseUseCase<JumpTaskPayload, TaskCardEntity> {
  constructor(private repository: TaskBoardRepository) {}

  execute(payload: JumpTaskPayload): Observable<TaskCardEntity> {
    return this.repository.jump(payload);
  }
}
