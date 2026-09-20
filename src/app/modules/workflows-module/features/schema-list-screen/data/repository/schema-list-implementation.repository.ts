import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '@environments/environment';
import {
  NodeFormPayload,
  SchemaEntity,
  SchemaFormPayload,
  SchemaNode,
  SchemaTaskBankOption,
  SchemaTypeOption,
  StepFormPayload,
} from '../../domain/entity/schema-list.entity';
import { SchemaListRepository } from '../../domain/repository/schema-list.repository';
import { SchemaListLocalDataSource } from '../data_source/local/schema-list-local-datasource';
import { SchemaListRemoteDataSource } from '../data_source/remote/schema-list-remote-datasource';
import { SchemaListMapper } from '../model/schema-list.model';

@Injectable()
export class SchemaListImplementationRepository implements SchemaListRepository {
  constructor(
    private local: SchemaListLocalDataSource,
    private remote: SchemaListRemoteDataSource,
  ) {}

  getSchemas(): Observable<SchemaEntity[]> {
    const source = environment.useMock ? this.local.getSchemas() : this.remote.getSchemas();
    return source.pipe(map((rows) => rows.map((row) => SchemaListMapper.toEntity(row))));
  }

  saveSchema(payload: SchemaFormPayload): Observable<SchemaEntity> {
    const source = environment.useMock ? this.local.saveSchema(payload) : this.remote.saveSchema(payload);
    return source.pipe(map((row) => SchemaListMapper.toEntity(row)));
  }

  archiveSchema(id: number): Observable<void> {
    return environment.useMock ? this.local.archiveSchema(id) : this.remote.archiveSchema(id);
  }

  listTypes(): Observable<SchemaTypeOption[]> {
    return environment.useMock ? this.local.listTypes() : this.remote.listTypes();
  }

  listTaskBank(): Observable<SchemaTaskBankOption[]> {
    return environment.useMock ? this.local.listTaskBank() : this.remote.listTaskBank();
  }

  getGraph(schemaId: number): Observable<SchemaNode[]> {
    const source = environment.useMock ? this.local.getGraph(schemaId) : this.remote.getGraph(schemaId);
    return source.pipe(map((rows) => rows.map((row) => SchemaListMapper.toNode(row))));
  }

  saveNode(payload: NodeFormPayload): Observable<void> {
    return environment.useMock ? this.local.saveNode(payload) : this.remote.saveNode(payload);
  }

  archiveNode(id: number): Observable<void> {
    return environment.useMock ? this.local.archiveNode(id) : this.remote.archiveNode(id);
  }

  saveStep(payload: StepFormPayload): Observable<void> {
    return environment.useMock ? this.local.saveStep(payload) : this.remote.saveStep(payload);
  }

  archiveStep(id: number): Observable<void> {
    return environment.useMock ? this.local.archiveStep(id) : this.remote.archiveStep(id);
  }
}
