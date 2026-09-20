import { Injectable } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { API, apiPath } from '@core/network/api/api.const';
import { mapHttpError } from '@core/network/http-error';
import { NetworkService } from '@core/network/network.service';
import { CatalogSectionDetail, OrganizationCatalogService } from '@core/network/organization-catalog.service';
import { UserDirectoryService } from '@core/network/user-directory.service';
import { SectionFormPayload } from '../../../domain/entity/section-list.entity';
import { SectionFormOptionsModel, SectionModel } from '../../model/section-list.model';
import { SectionListRemoteDataSource } from './section-list-remote-datasource';

@Injectable()
export class SectionListRemoteDataSourceImpl extends SectionListRemoteDataSource {
  constructor(
    private network: NetworkService,
    private organization: OrganizationCatalogService,
    private users: UserDirectoryService,
  ) {
    super();
  }

  getSections(): Observable<SectionModel[]> {
    return this.organization.refreshSections().pipe(
      switchMap((rows) => {
        if (!rows.length) {
          return of([] as SectionModel[]);
        }
        return forkJoin(rows.map((row) => this.organization.getSection(row.id).pipe(map((detail) => this.toModel(detail)))));
      }),
    );
  }

  saveSection(payload: SectionFormPayload): Observable<SectionModel> {
    const body = { name: payload.name, headId: payload.headId, teamIds: payload.teamIds };
    const request$ = payload.id
      ? this.network.put<CatalogSectionDetail>(apiPath(API.Sections.Update, { id: payload.id }), body)
      : this.network.post<CatalogSectionDetail>(API.Sections.Create, body);
    return request$.pipe(
      switchMap((row) => this.organization.refreshSections().pipe(switchMap(() => this.organization.getSection(row.id)))),
      map((row) => this.toModel(row)),
      catchError(mapHttpError),
    );
  }

  archiveSection(id: number): Observable<void> {
    return this.network.delete(apiPath(API.Sections.Archive, { id })).pipe(
      switchMap(() => this.organization.refreshSections().pipe(map(() => undefined))),
      catchError(mapHttpError),
    );
  }

  getFormOptions(): Observable<SectionFormOptionsModel> {
    return forkJoin({
      heads: this.users.refresh(),
      teams: this.organization.refreshTeams(),
    }).pipe(
      map(({ heads, teams }) => ({
        heads: heads.map((row) => ({ id: row.id, name: row.name })),
        teams: teams.map((row) => ({ id: row.id, name: row.name })),
      })),
    );
  }

  private toModel(row: CatalogSectionDetail): SectionModel {
    return {
      id: row.id,
      name: row.name,
      headId: row.head?.id ?? 0,
      headName: row.head?.name ?? '',
      teams: row.teams ?? [],
    };
  }
}
