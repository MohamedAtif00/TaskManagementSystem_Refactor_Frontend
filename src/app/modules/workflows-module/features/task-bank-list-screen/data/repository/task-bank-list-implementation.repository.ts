import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { TaskBankFormPayload, TaskBankItem, TaskBankTeamOption } from '../../domain/entity/task-bank-list.entity';
import { TaskBankListRepository } from '../../domain/repository/task-bank-list.repository';
import { TaskBankListLocalDataSource } from '../data_source/local/task-bank-list-local-datasource';
import { TaskBankListRemoteDataSource } from '../data_source/remote/task-bank-list-remote-datasource';
import { TaskBankListMapper } from '../model/task-bank-list.model';

@Injectable()
export class TaskBankListImplementationRepository implements TaskBankListRepository {
  constructor(
    private local: TaskBankListLocalDataSource,
    private remote: TaskBankListRemoteDataSource,
  ) {}

  getItems(): Observable<TaskBankItem[]> {
    const source = environment.useMock ? this.local.getItems() : this.remote.getItems();
    return source.pipe(map((rows) => rows.map((row) => TaskBankListMapper.toEntity(row))));
  }

  saveItem(payload: TaskBankFormPayload): Observable<TaskBankItem> {
    const source = environment.useMock ? this.local.saveItem(payload) : this.remote.saveItem(payload);
    return source.pipe(map((row) => TaskBankListMapper.toEntity(row)));
  }

  archiveItem(id: number): Observable<void> {
    return environment.useMock ? this.local.archiveItem(id) : this.remote.archiveItem(id);
  }

  listTeams(): Observable<TaskBankTeamOption[]> {
    return environment.useMock ? this.local.listTeams() : this.remote.listTeams();
  }
}
