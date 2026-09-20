import { Observable } from 'rxjs';
import { TaskBankFormPayload, TaskBankItem, TaskBankTeamOption } from '../entity/task-bank-list.entity';

export abstract class TaskBankListRepository {
  abstract getItems(): Observable<TaskBankItem[]>;
  abstract saveItem(payload: TaskBankFormPayload): Observable<TaskBankItem>;
  abstract archiveItem(id: number): Observable<void>;
  abstract listTeams(): Observable<TaskBankTeamOption[]>;
}
