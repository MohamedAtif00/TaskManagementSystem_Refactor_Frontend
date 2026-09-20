import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseUseCase } from '@core/base/usecase/base-usecase';
import { TaskComment } from '../entity/task-board.entity';
import { TaskBoardRepository } from '../repository/task-board.repository';

export interface AddCommentPayload {
  ticketId: number;
  content: string;
}

@Injectable()
export class AddCommentUseCase implements BaseUseCase<AddCommentPayload, TaskComment> {
  constructor(private repository: TaskBoardRepository) {}

  execute(params: AddCommentPayload): Observable<TaskComment> {
    return this.repository.addComment(params.ticketId, params.content);
  }
}
