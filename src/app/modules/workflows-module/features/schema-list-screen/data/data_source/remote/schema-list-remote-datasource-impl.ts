import { Injectable } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { API, apiPath } from '@core/network/api/api.const';
import { mapHttpError } from '@core/network/http-error';
import { NetworkService } from '@core/network/network.service';
import { CatalogSchema, WorkflowCatalogService } from '@core/network/workflow-catalog.service';
import {
  NodeFormPayload,
  SchemaFormPayload,
  SchemaTaskBankOption,
  SchemaTypeOption,
  StepFormPayload,
} from '../../../domain/entity/schema-list.entity';
import { SchemaModel, SchemaNodeModel } from '../../model/schema-list.model';
import { SchemaListRemoteDataSource } from './schema-list-remote-datasource';

interface NodeDto {
  id: number;
  name: string;
  order: number;
  isStart: boolean;
  isEnd: boolean;
  schemaId: number;
}

interface StepDto {
  id: number;
  order: number;
  duration: number;
  priority: number;
  nodeId: number;
  ticketBankId: number;
}

@Injectable()
export class SchemaListRemoteDataSourceImpl extends SchemaListRemoteDataSource {
  constructor(
    private network: NetworkService,
    private workflows: WorkflowCatalogService,
  ) {
    super();
  }

  getSchemas(): Observable<SchemaModel[]> {
    return this.workflows.listSchemaTypes().pipe(
      switchMap((types) =>
        this.workflows.refreshSchemas().pipe(
          map((rows) =>
            rows.map((row) => ({
              id: row.id,
              name: row.name,
              description: row.description ?? '',
              typeId: row.typeId,
              typeName: types.find((type) => type.id === row.typeId)?.name ?? '',
            })),
          ),
        ),
      ),
    );
  }

  saveSchema(payload: SchemaFormPayload): Observable<SchemaModel> {
    const body = {
      name: payload.name,
      description: payload.description || '',
      typeId: payload.typeId || null,
    };
    const request$ =
      payload.id != null
        ? this.network.put<CatalogSchema>(apiPath(API.Schemas.Update, { id: payload.id }), body)
        : this.network.post<CatalogSchema>(API.Schemas.Create, body);
    return request$.pipe(
      switchMap((row) => this.workflows.refreshSchemas().pipe(map(() => row))),
      switchMap((row) => this.workflows.listSchemaTypes().pipe(map((types) => this.toSchema(row, types)))),
      catchError(mapHttpError),
    );
  }

  archiveSchema(id: number): Observable<void> {
    return this.network.delete(apiPath(API.Schemas.Archive, { id })).pipe(
      switchMap(() => this.workflows.refreshSchemas().pipe(map(() => undefined))),
      catchError(mapHttpError),
    );
  }

  listTypes(): Observable<SchemaTypeOption[]> {
    return this.workflows.listSchemaTypes();
  }

  listTaskBank(): Observable<SchemaTaskBankOption[]> {
    return this.workflows.refreshTaskBank().pipe(map((rows) => rows.map((row) => ({ id: row.id, name: row.name }))));
  }

  getGraph(schemaId: number): Observable<SchemaNodeModel[]> {
    return this.workflows.listTaskBank().pipe(
      switchMap((bank) =>
        this.network.get<NodeDto[]>(apiPath(API.Schemas.Nodes, { schemaId })).pipe(
          switchMap((nodes) => {
            if (!nodes.length) {
              return of([] as SchemaNodeModel[]);
            }
            return forkJoin(
              nodes.map((node) =>
                this.network.get<StepDto[]>(apiPath(API.WorkflowNodes.Steps, { nodeId: node.id })).pipe(
                  catchError(() => of([] as StepDto[])),
                  map((steps) => this.toNode(node, steps, bank)),
                ),
              ),
            );
          }),
          catchError(mapHttpError),
        ),
      ),
    );
  }

  saveNode(payload: NodeFormPayload): Observable<void> {
    const body = { name: payload.name, isStart: payload.isStart, isEnd: payload.isEnd };
    const request$ =
      payload.id != null
        ? this.network.put(apiPath(API.WorkflowNodes.ById, { id: payload.id }), body)
        : this.network.post(apiPath(API.Schemas.Nodes, { schemaId: payload.schemaId }), body);
    return request$.pipe(
      map(() => undefined),
      catchError(mapHttpError),
    );
  }

  archiveNode(id: number): Observable<void> {
    return this.network.delete(apiPath(API.WorkflowNodes.ById, { id })).pipe(
      map(() => undefined),
      catchError(mapHttpError),
    );
  }

  saveStep(payload: StepFormPayload): Observable<void> {
    const body = { ticketBankId: payload.taskBankId, duration: payload.duration, priority: payload.priority };
    const request$ =
      payload.id != null
        ? this.network.put(apiPath(API.WorkflowSteps.ById, { id: payload.id }), body)
        : this.network.post(apiPath(API.WorkflowNodes.Steps, { nodeId: payload.nodeId }), body);
    return request$.pipe(
      map(() => undefined),
      catchError(mapHttpError),
    );
  }

  archiveStep(id: number): Observable<void> {
    return this.network.delete(apiPath(API.WorkflowSteps.ById, { id })).pipe(
      map(() => undefined),
      catchError(mapHttpError),
    );
  }

  private toSchema(row: CatalogSchema, types: SchemaTypeOption[]): SchemaModel {
    return {
      id: row.id,
      name: row.name,
      description: row.description ?? '',
      typeId: row.typeId,
      typeName: types.find((type) => type.id === row.typeId)?.name ?? '',
    };
  }

  private toNode(
    node: NodeDto,
    steps: StepDto[],
    bank: { id: number; name: string }[],
  ): SchemaNodeModel {
    return {
      id: node.id,
      name: node.name,
      order: node.order,
      isStart: node.isStart,
      isEnd: node.isEnd,
      schemaId: node.schemaId,
      steps: steps.map((step) => ({
        id: step.id,
        order: step.order,
        duration: step.duration,
        priority: step.priority,
        nodeId: step.nodeId,
        taskBankId: step.ticketBankId,
        taskBankName: bank.find((item) => item.id === step.ticketBankId)?.name ?? `Item ${step.ticketBankId}`,
      })),
    };
  }
}
