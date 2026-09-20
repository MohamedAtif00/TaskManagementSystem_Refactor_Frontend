import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseUseCase } from '@core/base/usecase/base-usecase';
import { TaskBankFormPayload, TaskBankItem } from '../entity/task-bank-list.entity';
import { TaskBankListRepository } from '../repository/task-bank-list.repository';

@Injectable()
export class SaveTaskBankItemUseCase implements BaseUseCase<TaskBankFormPayload, TaskBankItem> {
  constructor(private repository: TaskBankListRepository) {}

  execute(payload: TaskBankFormPayload): Observable<TaskBankItem> {
    return this.repository.saveItem(payload);
  }
}
