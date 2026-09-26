import { Observable } from 'rxjs';
import { CurriculumStatusTab } from '@core/models/curriculum-status-tab';
import {
  ArchiveCurriculumPayload,
  CurriculumNode,
  CurriculumSchemaOption,
  CurriculumUserOption,
  SaveCurriculumPayload,
} from '../entity/curriculum-admin.entity';

export abstract class CurriculumAdminRepository {
  abstract getTree(statusTab: CurriculumStatusTab): Observable<CurriculumNode[]>;
  abstract loadChildren(node: CurriculumNode): Observable<CurriculumNode[]>;
  abstract save(payload: SaveCurriculumPayload): Observable<void>;
  abstract archive(payload: ArchiveCurriculumPayload): Observable<void>;
  abstract listSchemas(): Observable<CurriculumSchemaOption[]>;
  abstract listUsers(): Observable<CurriculumUserOption[]>;
  abstract getSubjectUsers(subjectId: number): Observable<number[]>;
}
