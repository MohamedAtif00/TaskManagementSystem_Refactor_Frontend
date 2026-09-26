import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ListPageResponse } from '@core/models/list-page.model';
import { API } from '@core/network/api/api.const';
import { mapHttpError } from '@core/network/http-error';
import { NetworkService } from '@core/network/network.service';

export interface ReportSubjectCatalogItem {
  id: number;
  name: string;
  folderPath: string;
  year: string;
  term: string;
  progressPercent: number;
}

export interface ReportSubjectCatalogParams {
  page: number;
  pageSize: number;
  search?: string;
  year?: string;
  term?: string;
  activeOnly?: boolean;
}

interface SubjectCatalogDto {
  id: number;
  name: string;
  folderPath: string;
  year: string;
  term: string;
  status: number;
  progressPercent: number;
}

@Injectable({ providedIn: 'root' })
export class ReportsSubjectCatalogService {
  constructor(private network: NetworkService) {}

  loadPage(params: ReportSubjectCatalogParams): Observable<ListPageResponse<ReportSubjectCatalogItem>> {
    let httpParams = new HttpParams()
      .set('page', String(params.page))
      .set('pageSize', String(params.pageSize))
      .set('activeOnly', String(params.activeOnly ?? true));
    if (params.search?.trim()) {
      httpParams = httpParams.set('search', params.search.trim());
    }
    if (params.year) {
      httpParams = httpParams.set('year', params.year);
    }
    if (params.term) {
      httpParams = httpParams.set('term', params.term);
    }

    return this.network.get<ListPageResponse<SubjectCatalogDto>>(API.Curriculum.SubjectsCatalog, httpParams).pipe(
      map((page) => ({
        items: (page.items ?? []).map((row) => ({
          id: row.id,
          name: row.name,
          folderPath: row.folderPath,
          year: row.year,
          term: row.term,
          progressPercent: row.progressPercent,
        })),
        page: page.page,
        pageSize: page.pageSize,
        totalCount: page.totalCount,
      })),
      catchError(mapHttpError),
    );
  }
}
