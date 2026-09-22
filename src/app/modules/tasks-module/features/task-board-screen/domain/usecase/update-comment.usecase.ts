import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseUseCase } from '@core/base/usecase/base-usecase';
import { TaskComment } from '../entity/task-board.entity';
import { TaskBoardRepository } from '../repository/task-board.repository';

export interface UpdateCommentPayload {
  ticketId: number;
  commentId: number;
  content: string;
}

@Injectable()
export class UpdateCommentUseCase implements BaseUseCase<UpdateCommentPayload, TaskComment> {
  constructor(private repository: TaskBoardRepository) {}

  execute(payload: UpdateCommentPayload): Observable<TaskComment> {
    return this.repository.updateComment(payload);
  }
}
