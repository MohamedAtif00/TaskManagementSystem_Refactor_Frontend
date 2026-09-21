import { Observable } from 'rxjs';
import { TeamFormPayload, TeamMemberOption } from '../../../domain/entity/team-list.entity';
import { TeamModel } from '../../model/team-list.model';

export abstract class TeamListRemoteDataSource {
  abstract getTeams(): Observable<TeamModel[]>;
  abstract getTeam(id: number): Observable<TeamModel>;
  abstract getMemberOptions(): Observable<TeamMemberOption[]>;
  abstract saveTeam(payload: TeamFormPayload): Observable<TeamModel>;
  abstract archiveTeam(id: number): Observable<void>;
}
