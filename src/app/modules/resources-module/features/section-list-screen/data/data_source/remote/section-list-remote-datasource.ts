import { Observable } from 'rxjs';
import { SectionFormPayload } from '../../../domain/entity/section-list.entity';
import { SectionFormOptionsModel, SectionModel } from '../../model/section-list.model';

export abstract class SectionListRemoteDataSource {
  abstract getSections(): Observable<SectionModel[]>;
  abstract saveSection(payload: SectionFormPayload): Observable<SectionModel>;
  abstract archiveSection(id: number): Observable<void>;
  abstract getFormOptions(): Observable<SectionFormOptionsModel>;
}
