import { Observable } from 'rxjs';
import { TeamEntity, TeamFormPayload } from '../entity/team-list.entity';

export abstract class TeamListRepository {
  abstract getTeams(): Observable<TeamEntity[]>;
  abstract getTeam(id: number): Observable<TeamEntity>;
  abstract saveTeam(payload: TeamFormPayload): Observable<TeamEntity>;
  abstract archiveTeam(id: number): Observable<void>;
}
