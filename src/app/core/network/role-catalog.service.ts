import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map, shareReplay } from 'rxjs/operators';
import { API } from './api/api.const';
import { mapHttpError } from './http-error';
import { NetworkService } from './network.service';

export interface CatalogRole {
  id: number;
  name: string;
  description?: string;
  isSystem: boolean;
  permissionCodes: string[];
}

export interface CatalogPermission {
  id: number;
  code: string;
  name: string;
  description?: string;
  isSystem: boolean;
}

@Injectable({ providedIn: 'root' })
export class RoleCatalogService {
  private roles$?: Observable<CatalogRole[]>;
  private permissions$?: Observable<CatalogPermission[]>;

  constructor(private network: NetworkService) {}

  listRoles(): Observable<CatalogRole[]> {
    this.roles$ ??= this.network.get<CatalogRole[]>(API.Roles.List).pipe(
      catchError(mapHttpError),
      shareReplay(1),
    );
    return this.roles$;
  }

  listPermissions(): Observable<CatalogPermission[]> {
    this.permissions$ ??= this.network.get<CatalogPermission[]>(API.RbacPermissions.List).pipe(
      catchError(mapHttpError),
      shareReplay(1),
    );
    return this.permissions$;
  }

  refreshRoles(): Observable<CatalogRole[]> {
    this.roles$ = undefined;
    return this.listRoles();
  }

  refreshPermissions(): Observable<CatalogPermission[]> {
    this.permissions$ = undefined;
    return this.listPermissions();
  }

  permissionIdsFor(role: CatalogRole, permissions: CatalogPermission[]): number[] {
    const codes = new Set(role.permissionCodes ?? []);
    return permissions.filter((row) => codes.has(row.code)).map((row) => row.id);
  }
}
