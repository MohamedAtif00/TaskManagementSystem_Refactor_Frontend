import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseUseCase } from '@core/base/usecase/base-usecase';
import { TaskBankListRepository } from '../repository/task-bank-list.repository';

@Injectable()
export class ArchiveTaskBankItemUseCase implements BaseUseCase<number, void> {
  constructor(private repository: TaskBankListRepository) {}

  execute(id: number): Observable<void> {
    return this.repository.archiveItem(id);
  }
}
