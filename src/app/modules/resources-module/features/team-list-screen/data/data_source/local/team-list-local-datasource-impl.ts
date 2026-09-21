import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { TmsMockStore } from '@core/mock/tms-mock.store';
import { TeamFormPayload, TeamMemberOption } from '../../../domain/entity/team-list.entity';
import { TeamModel } from '../../model/team-list.model';
import { TeamListLocalDataSource } from './team-list-local-datasource';

@Injectable()
export class TeamListLocalDataSourceImpl extends TeamListLocalDataSource {
  constructor(private store: TmsMockStore) {
    super();
  }

  getTeams(): Observable<TeamModel[]> {
    return of(
      this.store.listTeams().map((row) => ({
        id: row.id,
        name: row.name,
        memberCount: row.members,
        members: [],
        teamleaderId: row.teamleaderId,
        teamleaderName: row.teamleaderName,
      })),
    ).pipe(delay(80));
  }

  getTeam(id: number): Observable<TeamModel> {
    const team = this.store.getTeam(id);
    if (!team) {
      return throwError(() => new Error('Team not found'));
    }
    return of({
      id: team.id,
      name: team.name,
      memberCount: team.members.length,
      members: team.members,
      teamleaderId: team.teamleaderId,
      teamleaderName: team.teamleaderName,
    }).pipe(delay(80));
  }

  getMemberOptions(): Observable<TeamMemberOption[]> {
    return of(
      this.store
        .listAdminUsers()
        .map((user) => ({
          id: user.id,
          name: user.name,
          teamId: user.teamId ?? null,
        })),
    ).pipe(delay(80));
  }

  saveTeam(payload: TeamFormPayload): Observable<TeamModel> {
    const saved = this.store.saveTeam(payload);
    if (!saved) {
      return throwError(() => new Error('Team not found'));
    }
    return of({
      id: saved.id,
      name: saved.name,
      memberCount: saved.members.length,
      members: saved.members,
      teamleaderId: saved.teamleaderId,
      teamleaderName: saved.teamleaderName,
    }).pipe(
      delay(80),
    );
  }

  getTeamLeaders(): Observable<{ id: number; name: string }[]> {
    return of(
      this.store
        .listAdminUsers()
        .filter((user) => user.roleId === 1 || user.roleId === 2)
        .map((user) => ({ id: user.id, name: user.name })),
    ).pipe(delay(80));
  }

  archiveTeam(id: number): Observable<void> {
    if (!this.store.archiveTeam(id)) {
      return throwError(() => new Error('Team not found'));
    }
    return of(undefined).pipe(delay(80));
  }
}
