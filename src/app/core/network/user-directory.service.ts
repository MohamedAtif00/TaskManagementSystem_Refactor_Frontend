import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map, shareReplay } from 'rxjs/operators';
import { API } from './api/api.const';
import { mapHttpError } from './http-error';
import { NetworkService } from './network.service';

export interface DirectoryUser {
  id: number;
  code: string;
  name: string;
  roleId: number;
  roleName: string;
  teamId?: number | null;
  teamName?: string | null;
  hrCode?: string;
}

@Injectable({ providedIn: 'root' })
export class UserDirectoryService {
  private cache$?: Observable<DirectoryUser[]>;

  constructor(private network: NetworkService) {}

  list(): Observable<DirectoryUser[]> {
    this.cache$ ??= this.network.get<DirectoryUser[]>(API.Users.List).pipe(
      catchError(mapHttpError),
      shareReplay(1),
    );
    return this.cache$;
  }

  byId(id: number): Observable<DirectoryUser | undefined> {
    return this.list().pipe(map((users) => users.find((user) => user.id === id)));
  }

  refresh(): Observable<DirectoryUser[]> {
    this.cache$ = undefined;
    return this.list();
  }
}
