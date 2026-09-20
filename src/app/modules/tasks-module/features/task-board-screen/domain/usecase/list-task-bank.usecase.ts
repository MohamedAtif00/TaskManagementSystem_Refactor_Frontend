import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseUseCase } from '@core/base/usecase/base-usecase';
import { TaskBoardRepository } from '../repository/task-board.repository';

@Injectable()
export class ListTaskBankUseCase implements BaseUseCase<void, { id: number; name: string }[]> {
  constructor(private repository: TaskBoardRepository) {}

  execute(_params?: void): Observable<{ id: number; name: string }[]> {
    return this.repository.listTaskBank();
  }
}
