import { Observable } from 'rxjs';
import { TaskBankFormPayload, TaskBankTeamOption } from '../../../domain/entity/task-bank-list.entity';
import { TaskBankItemModel } from '../../model/task-bank-list.model';

export abstract class TaskBankListLocalDataSource {
  abstract getItems(): Observable<TaskBankItemModel[]>;
  abstract saveItem(payload: TaskBankFormPayload): Observable<TaskBankItemModel>;
  abstract archiveItem(id: number): Observable<void>;
  abstract listTeams(): Observable<TaskBankTeamOption[]>;
}
