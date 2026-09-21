import { Injectable } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { API, apiPath } from '@core/network/api/api.const';
import { mapHttpError } from '@core/network/http-error';
import { NetworkService } from '@core/network/network.service';
import { CatalogTeamDetail, OrganizationCatalogService } from '@core/network/organization-catalog.service';
import { UserDirectoryService } from '@core/network/user-directory.service';
import { TeamFormPayload, TeamMemberOption } from '../../../domain/entity/team-list.entity';
import { TeamModel } from '../../model/team-list.model';
import { TeamListRemoteDataSource } from './team-list-remote-datasource';

interface UserDetailDto {
  id: number;
  name: string;
  hrCode: string;
  email?: string;
  phone?: string;
  title?: string;
  roleId: number;
  accountType: number;
  teamId?: number | null;
}

@Injectable()
export class TeamListRemoteDataSourceImpl extends TeamListRemoteDataSource {
  constructor(
    private network: NetworkService,
    private organization: OrganizationCatalogService,
    private users: UserDirectoryService,
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
          teamleaderId: row.teamleaderId,
          teamleaderName: row.teamleaderName,
        })),
      ),
    );
  }

  getTeam(id: number): Observable<TeamModel> {
    return this.organization.getTeam(id).pipe(map((row) => this.toModel(row)));
  }

  getMemberOptions(): Observable<TeamMemberOption[]> {
    return this.users.list().pipe(
      map((rows) =>
        rows.map((row) => ({
          id: row.id,
          name: row.name,
          teamId: row.teamId ?? null,
        })),
      ),
      catchError(mapHttpError),
    );
  }

  getTeamLeaders(): Observable<{ id: number; name: string }[]> {
    return this.network.get<{ id: number; name: string }[]>(API.Users.TeamLeaders).pipe(catchError(mapHttpError));
  }

  saveTeam(payload: TeamFormPayload): Observable<TeamModel> {
    const body = { name: payload.name, teamleaderId: payload.teamleaderId ?? null };
    const teamRequest$ = payload.id
      ? this.network.put<CatalogTeamDetail>(apiPath(API.Teams.Update, { id: payload.id }), body)
      : this.network.post<CatalogTeamDetail>(API.Teams.Create, body);

    return teamRequest$.pipe(
      switchMap((team) =>
        this.syncMembers(team.id, payload.memberIds).pipe(
          switchMap(() => this.organization.refreshTeams()),
          switchMap(() => this.getTeam(team.id)),
        ),
      ),
      catchError(mapHttpError),
    );
  }

  archiveTeam(id: number): Observable<void> {
    return this.network.delete(apiPath(API.Teams.Archive, { id })).pipe(
      switchMap(() => this.organization.refreshTeams().pipe(map(() => undefined))),
      catchError(mapHttpError),
    );
  }

  private syncMembers(teamId: number, memberIds: number[]): Observable<void> {
    const selected = new Set(memberIds);
    return this.getTeam(teamId).pipe(
      switchMap((team) => {
        const currentIds = new Set(team.members.map((member) => member.id));
        const toAssign = [...selected].filter((id) => !currentIds.has(id));
        const toRemove = team.members.filter((member) => !selected.has(member.id)).map((member) => member.id);
        const updates = [
          ...toAssign.map((userId) => this.updateUserTeam(userId, teamId)),
          ...toRemove.map((userId) => this.updateUserTeam(userId, null)),
        ];
        if (!updates.length) {
          return of(undefined);
        }
        return forkJoin(updates).pipe(
          switchMap(() => this.users.refresh()),
          map(() => undefined),
        );
      }),
    );
  }

  private updateUserTeam(userId: number, teamId: number | null): Observable<void> {
    return this.network.get<UserDetailDto>(apiPath(API.Users.ById, { id: userId })).pipe(
      switchMap((user) =>
        this.network.put(apiPath(API.Users.Update, { id: userId }), {
          name: user.name,
          hrCode: user.hrCode,
          email: user.email || null,
          phone: user.phone || null,
          title: user.title || null,
          roleId: user.roleId,
          accountType: user.accountType,
          teamId,
        }),
      ),
      map(() => undefined),
      catchError(mapHttpError),
    );
  }

  private toModel(row: CatalogTeamDetail): TeamModel {
    return {
      id: row.id,
      name: row.name,
      memberCount: row.members.length,
      members: row.members,
      teamleaderId: row.teamleaderId,
      teamleaderName: row.teamleaderName,
    };
  }
}
