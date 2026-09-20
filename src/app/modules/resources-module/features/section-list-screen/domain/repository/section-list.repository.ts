import { Observable } from 'rxjs';
import { SectionEntity, SectionFormOptions, SectionFormPayload } from '../entity/section-list.entity';

export abstract class SectionListRepository {
  abstract getSections(): Observable<SectionEntity[]>;
  abstract saveSection(payload: SectionFormPayload): Observable<SectionEntity>;
  abstract archiveSection(id: number): Observable<void>;
  abstract getFormOptions(): Observable<SectionFormOptions>;
}
