import { Observable } from 'rxjs';
import {
  NodeFormPayload,
  SchemaFormPayload,
  SchemaTaskBankOption,
  SchemaTypeOption,
  StepFormPayload,
} from '../../../domain/entity/schema-list.entity';
import { SchemaModel, SchemaNodeModel } from '../../model/schema-list.model';

export abstract class SchemaListLocalDataSource {
  abstract getSchemas(): Observable<SchemaModel[]>;
  abstract saveSchema(payload: SchemaFormPayload): Observable<SchemaModel>;
  abstract archiveSchema(id: number): Observable<void>;
  abstract listTypes(): Observable<SchemaTypeOption[]>;
  abstract listTaskBank(): Observable<SchemaTaskBankOption[]>;
  abstract getGraph(schemaId: number): Observable<SchemaNodeModel[]>;
  abstract saveNode(payload: NodeFormPayload): Observable<void>;
  abstract archiveNode(id: number): Observable<void>;
  abstract saveStep(payload: StepFormPayload): Observable<void>;
  abstract archiveStep(id: number): Observable<void>;
}
