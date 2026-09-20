import { Observable } from 'rxjs';
import { SprintFormPayload, SprintListParams } from '../../../domain/entity/sprint-list.entity';
import { SprintLoModel, SprintModel, SprintSubjectModel } from '../../model/sprint-list.model';

export abstract class SprintListRemoteDataSource {
  abstract getSprints(params: SprintListParams): Observable<SprintModel[]>;
  abstract saveSprint(payload: SprintFormPayload): Observable<SprintModel>;
  abstract archiveSprint(id: number, archived: boolean): Observable<SprintModel>;
  abstract getSubjects(): Observable<SprintSubjectModel[]>;
  abstract getLos(subjectId: number): Observable<SprintLoModel[]>;
}
