import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, shareReplay } from 'rxjs/operators';
import { API } from './api/api.const';
import { mapHttpError } from './http-error';
import { NetworkService } from './network.service';

export interface CatalogSchema {
  id: number;
  name: string;
  description?: string;
  typeId?: number | null;
}

export interface CatalogSchemaType {
  id: number;
  name: string;
  description?: string;
}

export interface CatalogTaskBankItem {
  id: number;
  name: string;
  duration: number;
  type: number;
  teamLeaderOnly: boolean;
  teamId: number;
}

@Injectable({ providedIn: 'root' })
export class WorkflowCatalogService {
  private schemas$?: Observable<CatalogSchema[]>;
  private types$?: Observable<CatalogSchemaType[]>;
  private taskBank$?: Observable<CatalogTaskBankItem[]>;

  constructor(private network: NetworkService) {}

  listSchemas(): Observable<CatalogSchema[]> {
    this.schemas$ ??= this.network.get<CatalogSchema[]>(API.Schemas.List).pipe(
      map((rows) => (Array.isArray(rows) ? rows : [])),
      catchError(mapHttpError),
      shareReplay(1),
    );
    return this.schemas$;
  }

  refreshSchemas(): Observable<CatalogSchema[]> {
    this.schemas$ = undefined;
    return this.listSchemas();
  }

  listSchemaTypes(): Observable<CatalogSchemaType[]> {
    this.types$ ??= this.network.get<CatalogSchemaType[]>(API.SchemaTypes.List).pipe(
      map((rows) => (Array.isArray(rows) ? rows : [])),
      catchError(() => of([] as CatalogSchemaType[])),
      shareReplay(1),
    );
    return this.types$;
  }

  listTaskBank(): Observable<CatalogTaskBankItem[]> {
    this.taskBank$ ??= this.network.get<CatalogTaskBankItem[]>(API.TaskBank.List).pipe(
      map((rows) => (Array.isArray(rows) ? rows : [])),
      catchError(mapHttpError),
      shareReplay(1),
    );
    return this.taskBank$;
  }

  refreshTaskBank(): Observable<CatalogTaskBankItem[]> {
    this.taskBank$ = undefined;
    return this.listTaskBank();
  }
}
