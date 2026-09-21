import { Observable } from 'rxjs';
import { TeamEntity, TeamFormPayload, TeamMemberOption } from '../entity/team-list.entity';

export abstract class TeamListRepository {
  abstract getTeams(): Observable<TeamEntity[]>;
  abstract getTeam(id: number): Observable<TeamEntity>;
  abstract getMemberOptions(): Observable<TeamMemberOption[]>;
  abstract saveTeam(payload: TeamFormPayload): Observable<TeamEntity>;
  abstract archiveTeam(id: number): Observable<void>;
}
