import { Observable } from 'rxjs';
import { CurriculumStatusTab } from '@core/models/curriculum-status-tab';
import {
  ArchiveCurriculumPayload,
  CurriculumNode,
  SaveCurriculumPayload,
} from '../../../domain/entity/curriculum-admin.entity';
import { CurriculumNodeModel, CurriculumSchemaModel, CurriculumUserModel } from '../../model/curriculum-admin.model';

export abstract class CurriculumAdminRemoteDataSource {
  abstract getTree(statusTab: CurriculumStatusTab): Observable<CurriculumNodeModel[]>;
  abstract loadChildren(node: CurriculumNode): Observable<CurriculumNodeModel[]>;
  abstract save(payload: SaveCurriculumPayload): Observable<void>;
  abstract archive(payload: ArchiveCurriculumPayload): Observable<void>;
  abstract listSchemas(): Observable<CurriculumSchemaModel[]>;
  abstract listUsers(): Observable<CurriculumUserModel[]>;
  abstract getSubjectUsers(subjectId: number): Observable<number[]>;
}
