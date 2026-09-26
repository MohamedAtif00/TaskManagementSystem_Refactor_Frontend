import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, shareReplay } from 'rxjs/operators';
import { TicketSummaryResponse } from '@core/api/tms-contracts';
import { API } from './api/api.const';
import { mapHttpError } from './http-error';
import { NetworkService } from './network.service';

@Injectable({ providedIn: 'root' })
export class TicketSummaryService {
  private cache = new Map<string, Observable<TicketSummaryResponse>>();

  constructor(private network: NetworkService) {}

  loadForSubject(subjectId: number): Observable<TicketSummaryResponse> {
    const params = new HttpParams().set('subjectId', String(subjectId));
    return this.cached(`subject:${subjectId}`, params);
  }

  loadForSprint(sprintId: number): Observable<TicketSummaryResponse> {
    const params = new HttpParams().set('sprintId', String(sprintId));
    return this.cached(`sprint:${sprintId}`, params);
  }

  invalidateSubject(subjectId: number): void {
    this.cache.delete(`subject:${subjectId}`);
  }

  invalidateSprint(sprintId: number): void {
    this.cache.delete(`sprint:${sprintId}`);
  }

  invalidate(): void {
    this.cache.clear();
  }

  private cached(key: string, params: HttpParams): Observable<TicketSummaryResponse> {
    const existing = this.cache.get(key);
    if (existing) {
      return existing;
    }

    const request$ = this.network.get<TicketSummaryResponse>(API.Tickets.Summary, params).pipe(
      catchError(mapHttpError),
      shareReplay(1),
    );
    this.cache.set(key, request$);
    return request$;
  }
}
