import { Observable } from 'rxjs';
import {
  NodeFormPayload,
  SchemaEntity,
  SchemaFormPayload,
  SchemaNode,
  SchemaTaskBankOption,
  SchemaTypeOption,
  StepFormPayload,
} from '../entity/schema-list.entity';

export abstract class SchemaListRepository {
  abstract getSchemas(): Observable<SchemaEntity[]>;
  abstract saveSchema(payload: SchemaFormPayload): Observable<SchemaEntity>;
  abstract archiveSchema(id: number): Observable<void>;
  abstract listTypes(): Observable<SchemaTypeOption[]>;
  abstract listTaskBank(): Observable<SchemaTaskBankOption[]>;
  abstract getGraph(schemaId: number): Observable<SchemaNode[]>;
  abstract saveNode(payload: NodeFormPayload): Observable<void>;
  abstract archiveNode(id: number): Observable<void>;
  abstract saveStep(payload: StepFormPayload): Observable<void>;
  abstract archiveStep(id: number): Observable<void>;
}
