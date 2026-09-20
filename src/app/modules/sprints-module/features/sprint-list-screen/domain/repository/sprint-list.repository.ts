import { Observable } from 'rxjs';
import {
  SprintEntity,
  SprintFormPayload,
  SprintListParams,
  SprintLoOption,
  SprintSubjectOption,
} from '../entity/sprint-list.entity';

export abstract class SprintListRepository {
  abstract getSprints(params: SprintListParams): Observable<SprintEntity[]>;
  abstract saveSprint(payload: SprintFormPayload): Observable<SprintEntity>;
  abstract archiveSprint(id: number, archived: boolean): Observable<SprintEntity>;
  abstract getSubjects(): Observable<SprintSubjectOption[]>;
  abstract getLos(subjectId: number): Observable<SprintLoOption[]>;
}
