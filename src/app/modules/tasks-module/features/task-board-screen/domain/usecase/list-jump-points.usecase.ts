import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseUseCase } from '@core/base/usecase/base-usecase';
import { JumpPoint } from '../entity/task-board.entity';
import { TaskBoardRepository } from '../repository/task-board.repository';

@Injectable()
export class ListJumpPointsUseCase implements BaseUseCase<number, JumpPoint[]> {
  constructor(private repository: TaskBoardRepository) {}

  execute(ticketId: number): Observable<JumpPoint[]> {
    return this.repository.listJumpPoints(ticketId);
  }
}
