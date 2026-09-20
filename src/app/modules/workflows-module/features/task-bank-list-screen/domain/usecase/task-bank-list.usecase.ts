import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseUseCase, NoParam } from '@core/base/usecase/base-usecase';
import { TaskBankItem } from '../entity/task-bank-list.entity';
import { TaskBankListRepository } from '../repository/task-bank-list.repository';

@Injectable()
export class TaskBankListUseCase implements BaseUseCase<NoParam, TaskBankItem[]> {
  constructor(private repository: TaskBankListRepository) {}

  execute(): Observable<TaskBankItem[]> {
    return this.repository.getItems();
  }
}
