import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, shareReplay } from 'rxjs/operators';
import { API, apiPath } from './api/api.const';
import { mapHttpError } from './http-error';
import { NetworkService } from './network.service';

export interface CatalogTeam {
  id: number;
  name: string;
  members: number;
  teamleaderId?: number | null;
  teamleaderName?: string | null;
}

export interface CatalogTeamDetail {
  id: number;
  name: string;
  members: { id: number; name: string }[];
  teamleaderId?: number | null;
  teamleaderName?: string | null;
}

export interface CatalogSection {
  id: number;
  name: string;
}

export interface CatalogSectionDetail {
  id: number;
  name: string;
  head: { id: number; name: string };
  teams: { id: number; name: string }[];
}

@Injectable({ providedIn: 'root' })
export class OrganizationCatalogService {
  private teams$?: Observable<CatalogTeam[]>;
  private sections$?: Observable<CatalogSection[]>;

  constructor(private network: NetworkService) {}

  listTeams(): Observable<CatalogTeam[]> {
    this.teams$ ??= this.network.get<CatalogTeam[]>(API.Teams.List).pipe(
      catchError(mapHttpError),
      shareReplay(1),
    );
    return this.teams$;
  }

  getTeam(id: number): Observable<CatalogTeamDetail> {
    return this.network.get<CatalogTeamDetail>(apiPath(API.Teams.ById, { id })).pipe(catchError(mapHttpError));
  }

  refreshTeams(): Observable<CatalogTeam[]> {
    this.teams$ = undefined;
    return this.listTeams();
  }

  listSections(): Observable<CatalogSection[]> {
    this.sections$ ??= this.network.get<CatalogSection[]>(API.Sections.List).pipe(
      catchError(mapHttpError),
      shareReplay(1),
    );
    return this.sections$;
  }

  getSection(id: number): Observable<CatalogSectionDetail> {
    return this.network.get<CatalogSectionDetail>(apiPath(API.Sections.ById, { id })).pipe(catchError(mapHttpError));
  }

  refreshSections(): Observable<CatalogSection[]> {
    this.sections$ = undefined;
    return this.listSections();
  }
}
