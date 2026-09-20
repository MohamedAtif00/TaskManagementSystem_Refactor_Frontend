import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { TeamEntity, TeamFormPayload } from '../../domain/entity/team-list.entity';
import { TeamListRepository } from '../../domain/repository/team-list.repository';
import { TeamListLocalDataSource } from '../data_source/local/team-list-local-datasource';
import { TeamListRemoteDataSource } from '../data_source/remote/team-list-remote-datasource';
import { TeamListMapper } from '../model/team-list.model';

@Injectable()
export class TeamListImplementationRepository implements TeamListRepository {
  constructor(
    private local: TeamListLocalDataSource,
    private remote: TeamListRemoteDataSource,
  ) {}

  getTeams(): Observable<TeamEntity[]> {
    const source = environment.useMock ? this.local.getTeams() : this.remote.getTeams();
    return source.pipe(map((rows) => rows.map((row) => TeamListMapper.toEntity(row))));
  }

  getTeam(id: number): Observable<TeamEntity> {
    const source = environment.useMock ? this.local.getTeam(id) : this.remote.getTeam(id);
    return source.pipe(map((row) => TeamListMapper.toEntity(row)));
  }

  saveTeam(payload: TeamFormPayload): Observable<TeamEntity> {
    const source = environment.useMock ? this.local.saveTeam(payload) : this.remote.saveTeam(payload);
    return source.pipe(map((row) => TeamListMapper.toEntity(row)));
  }

  archiveTeam(id: number): Observable<void> {
    return environment.useMock ? this.local.archiveTeam(id) : this.remote.archiveTeam(id);
  }
}
