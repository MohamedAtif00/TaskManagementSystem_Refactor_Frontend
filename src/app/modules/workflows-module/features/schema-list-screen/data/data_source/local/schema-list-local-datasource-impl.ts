import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import {
  NodeFormPayload,
  SchemaFormPayload,
  SchemaTaskBankOption,
  SchemaTypeOption,
  StepFormPayload,
} from '../../../domain/entity/schema-list.entity';
import { SchemaModel, SchemaNodeModel } from '../../model/schema-list.model';
import { SchemaListLocalDataSource } from './schema-list-local-datasource';

@Injectable()
export class SchemaListLocalDataSourceImpl extends SchemaListLocalDataSource {
  private nextId = 10;
  private types: SchemaTypeOption[] = [{ id: 1, name: 'Standard' }];
  private bank: SchemaTaskBankOption[] = [{ id: 1, name: 'Create ticket' }];
  private schemas: SchemaModel[] = [
    { id: 1, name: 'Default', description: 'Starter schema', typeId: 1, typeName: 'Standard' },
  ];
  private nodes: SchemaNodeModel[] = [
    {
      id: 1,
      name: 'Start',
      order: 1,
      isStart: true,
      isEnd: false,
      schemaId: 1,
      steps: [{ id: 1, order: 1, duration: 30, priority: 2, nodeId: 1, taskBankId: 1, taskBankName: 'Create ticket' }],
    },
  ];

  getSchemas(): Observable<SchemaModel[]> {
    return of(this.schemas.map((row) => ({ ...row }))).pipe(delay(80));
  }

  saveSchema(payload: SchemaFormPayload): Observable<SchemaModel> {
    const typeName = this.types.find((type) => type.id === payload.typeId)?.name ?? '';
    if (payload.id != null) {
      const found = this.schemas.find((row) => row.id === payload.id);
      if (!found) {
        return throwError(() => new Error('Schema not found'));
      }
      found.name = payload.name;
      found.description = payload.description;
      found.typeId = payload.typeId;
      found.typeName = typeName;
      return of({ ...found }).pipe(delay(80));
    }
    const created: SchemaModel = {
      id: this.nextId++,
      name: payload.name,
      description: payload.description,
      typeId: payload.typeId,
      typeName,
    };
    this.schemas.push(created);
    return of({ ...created }).pipe(delay(80));
  }

  archiveSchema(id: number): Observable<void> {
    this.schemas = this.schemas.filter((row) => row.id !== id);
    this.nodes = this.nodes.filter((node) => node.schemaId !== id);
    return of(undefined).pipe(delay(80));
  }

  listTypes(): Observable<SchemaTypeOption[]> {
    return of([...this.types]).pipe(delay(40));
  }

  listTaskBank(): Observable<SchemaTaskBankOption[]> {
    return of([...this.bank]).pipe(delay(40));
  }

  getGraph(schemaId: number): Observable<SchemaNodeModel[]> {
    return of(
      this.nodes
        .filter((node) => node.schemaId === schemaId)
        .map((node) => ({ ...node, steps: node.steps.map((step) => ({ ...step })) })),
    ).pipe(delay(80));
  }

  saveNode(payload: NodeFormPayload): Observable<void> {
    if (payload.id != null) {
      const found = this.nodes.find((node) => node.id === payload.id);
      if (found) {
        found.name = payload.name;
        found.isStart = payload.isStart;
        found.isEnd = payload.isEnd;
      }
      return of(undefined).pipe(delay(80));
    }
    this.nodes.push({
      id: this.nextId++,
      name: payload.name,
      order: this.nodes.filter((node) => node.schemaId === payload.schemaId).length + 1,
      isStart: payload.isStart,
      isEnd: payload.isEnd,
      schemaId: payload.schemaId,
      steps: [],
    });
    return of(undefined).pipe(delay(80));
  }

  archiveNode(id: number): Observable<void> {
    this.nodes = this.nodes.filter((node) => node.id !== id);
    return of(undefined).pipe(delay(80));
  }

  saveStep(payload: StepFormPayload): Observable<void> {
    const node = this.nodes.find((item) => item.id === payload.nodeId);
    if (!node) {
      return throwError(() => new Error('Node not found'));
    }
    const taskBankName = this.bank.find((item) => item.id === payload.taskBankId)?.name ?? '';
    if (payload.id != null) {
      const found = node.steps.find((step) => step.id === payload.id);
      if (found) {
        found.taskBankId = payload.taskBankId;
        found.duration = payload.duration;
        found.priority = payload.priority;
        found.taskBankName = taskBankName;
      }
      return of(undefined).pipe(delay(80));
    }
    node.steps.push({
      id: this.nextId++,
      order: node.steps.length + 1,
      duration: payload.duration,
      priority: payload.priority,
      nodeId: payload.nodeId,
      taskBankId: payload.taskBankId,
      taskBankName,
    });
    return of(undefined).pipe(delay(80));
  }

  archiveStep(id: number): Observable<void> {
    for (const node of this.nodes) {
      node.steps = node.steps.filter((step) => step.id !== id);
    }
    return of(undefined).pipe(delay(80));
  }
}
