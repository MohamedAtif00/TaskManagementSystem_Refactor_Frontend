import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { API, apiPath } from '@core/network/api/api.const';
import { mapHttpError } from '@core/network/http-error';
import { NetworkService } from '@core/network/network.service';
import { OrganizationCatalogService } from '@core/network/organization-catalog.service';
import { CatalogTaskBankItem, WorkflowCatalogService } from '@core/network/workflow-catalog.service';
import { TaskBankFormPayload, TaskBankTeamOption } from '../../../domain/entity/task-bank-list.entity';
import { TaskBankItemModel } from '../../model/task-bank-list.model';
import { TaskBankListRemoteDataSource } from './task-bank-list-remote-datasource';

@Injectable()
export class TaskBankListRemoteDataSourceImpl extends TaskBankListRemoteDataSource {
  constructor(
    private network: NetworkService,
    private workflows: WorkflowCatalogService,
    private organization: OrganizationCatalogService,
  ) {
    super();
  }

  getItems(): Observable<TaskBankItemModel[]> {
    return this.organization.listTeams().pipe(
      switchMap((teams) =>
        this.workflows.refreshTaskBank().pipe(map((rows) => rows.map((row) => this.toModel(row, teams)))),
      ),
    );
  }

  saveItem(payload: TaskBankFormPayload): Observable<TaskBankItemModel> {
    const body = {
      name: payload.name,
      duration: payload.duration,
      type: payload.type,
      teamLeaderOnly: payload.teamLeaderOnly,
      teamId: payload.teamId,
    };
    const request$ =
      payload.id != null
        ? this.network.put<CatalogTaskBankItem>(apiPath(API.TaskBank.Update, { id: payload.id }), body)
        : this.network.post<CatalogTaskBankItem>(API.TaskBank.Create, body);
    return request$.pipe(
      switchMap((row) => this.organization.listTeams().pipe(map((teams) => this.toModel(row, teams)))),
      switchMap((item) => this.workflows.refreshTaskBank().pipe(map(() => item))),
      catchError(mapHttpError),
    );
  }

  archiveItem(id: number): Observable<void> {
    return this.network.delete(apiPath(API.TaskBank.Archive, { id })).pipe(
      switchMap(() => this.workflows.refreshTaskBank().pipe(map(() => undefined))),
      catchError(mapHttpError),
    );
  }

  listTeams(): Observable<TaskBankTeamOption[]> {
    return this.organization.listTeams().pipe(map((rows) => rows.map((row) => ({ id: row.id, name: row.name }))));
  }

  private toModel(
    row: CatalogTaskBankItem,
    teams: { id: number; name: string }[],
  ): TaskBankItemModel {
    return {
      id: row.id,
      name: row.name,
      duration: row.duration,
      type: row.type,
      teamLeaderOnly: row.teamLeaderOnly,
      teamId: row.teamId,
      teamName: teams.find((team) => team.id === row.teamId)?.name ?? '',
    };
  }
}
