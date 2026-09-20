import { Observable } from 'rxjs';
import { TeamFormPayload } from '../../../domain/entity/team-list.entity';
import { TeamModel } from '../../model/team-list.model';

export abstract class TeamListRemoteDataSource {
  abstract getTeams(): Observable<TeamModel[]>;
  abstract getTeam(id: number): Observable<TeamModel>;
  abstract saveTeam(payload: TeamFormPayload): Observable<TeamModel>;
  abstract archiveTeam(id: number): Observable<void>;
}
