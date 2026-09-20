import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { API, apiPath } from '@core/network/api/api.const';
import { mapHttpError } from '@core/network/http-error';
import { NetworkService } from '@core/network/network.service';
import { CatalogTeamDetail, OrganizationCatalogService } from '@core/network/organization-catalog.service';
import { TeamFormPayload } from '../../../domain/entity/team-list.entity';
import { TeamModel } from '../../model/team-list.model';
import { TeamListRemoteDataSource } from './team-list-remote-datasource';

@Injectable()
export class TeamListRemoteDataSourceImpl extends TeamListRemoteDataSource {
  constructor(
    private network: NetworkService,
    private organization: OrganizationCatalogService,
  ) {
    super();
  }

  getTeams(): Observable<TeamModel[]> {
    return this.organization.refreshTeams().pipe(
      map((rows) =>
        rows.map((row) => ({
          id: row.id,
          name: row.name,
          memberCount: row.members,
          members: [],
        })),
      ),
    );
  }

  getTeam(id: number): Observable<TeamModel> {
    return this.organization.getTeam(id).pipe(map((row) => this.toModel(row)));
  }

  saveTeam(payload: TeamFormPayload): Observable<TeamModel> {
    const body = { name: payload.name };
    const request$ = payload.id
      ? this.network.put<CatalogTeamDetail>(apiPath(API.Teams.Update, { id: payload.id }), body)
      : this.network.post<CatalogTeamDetail>(API.Teams.Create, body);
    return request$.pipe(
      switchMap((row) => this.organization.refreshTeams().pipe(switchMap(() => this.getTeam(row.id)))),
      catchError(mapHttpError),
    );
  }

  archiveTeam(id: number): Observable<void> {
    return this.network.delete(apiPath(API.Teams.Archive, { id })).pipe(
      switchMap(() => this.organization.refreshTeams().pipe(map(() => undefined))),
      catchError(mapHttpError),
    );
  }

  private toModel(row: CatalogTeamDetail): TeamModel {
    return {
      id: row.id,
      name: row.name,
      memberCount: row.members.length,
      members: row.members,
    };
  }
}
