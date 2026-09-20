import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { TaskBankFormPayload, TaskBankTeamOption } from '../../../domain/entity/task-bank-list.entity';
import { TaskBankItemModel } from '../../model/task-bank-list.model';
import { TaskBankListLocalDataSource } from './task-bank-list-local-datasource';

@Injectable()
export class TaskBankListLocalDataSourceImpl extends TaskBankListLocalDataSource {
  private nextId = 2;
  private teams: TaskBankTeamOption[] = [{ id: 1, name: 'Integration Test Team' }];
  private items: TaskBankItemModel[] = [
    {
      id: 1,
      name: 'Create ticket',
      duration: 30,
      type: 0,
      teamLeaderOnly: false,
      teamId: 1,
      teamName: 'Integration Test Team',
    },
  ];

  getItems(): Observable<TaskBankItemModel[]> {
    return of(this.items.map((row) => ({ ...row }))).pipe(delay(80));
  }

  saveItem(payload: TaskBankFormPayload): Observable<TaskBankItemModel> {
    const teamName = this.teams.find((team) => team.id === payload.teamId)?.name ?? '';
    if (payload.id != null) {
      const found = this.items.find((row) => row.id === payload.id);
      if (!found) {
        return throwError(() => new Error('Task bank item not found'));
      }
      Object.assign(found, {
        name: payload.name,
        duration: payload.duration,
        type: payload.type,
        teamLeaderOnly: payload.teamLeaderOnly,
        teamId: payload.teamId,
        teamName,
      });
      return of({ ...found }).pipe(delay(80));
    }
    const created: TaskBankItemModel = {
      id: this.nextId++,
      name: payload.name,
      duration: payload.duration,
      type: payload.type,
      teamLeaderOnly: payload.teamLeaderOnly,
      teamId: payload.teamId,
      teamName,
    };
    this.items.push(created);
    return of({ ...created }).pipe(delay(80));
  }

  archiveItem(id: number): Observable<void> {
    const index = this.items.findIndex((row) => row.id === id);
    if (index < 0) {
      return throwError(() => new Error('Task bank item not found'));
    }
    this.items.splice(index, 1);
    return of(undefined).pipe(delay(80));
  }

  listTeams(): Observable<TaskBankTeamOption[]> {
    return of([...this.teams]).pipe(delay(40));
  }
}
