import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseUseCase } from '@core/base/usecase/base-usecase';
import { TaskBoardRepository } from '../repository/task-board.repository';

export interface DeleteCommentPayload {
  ticketId: number;
  commentId: number;
}

@Injectable()
export class DeleteCommentUseCase implements BaseUseCase<DeleteCommentPayload, void> {
  constructor(private repository: TaskBoardRepository) {}

  execute(payload: DeleteCommentPayload): Observable<void> {
    return this.repository.deleteComment(payload);
  }
}
