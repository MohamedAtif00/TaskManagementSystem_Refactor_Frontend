import { Injectable } from '@angular/core';
import { defer, Observable, forkJoin, of } from 'rxjs';
import { catchError, map, shareReplay } from 'rxjs/operators';
import { AnalyticsOverviewResponse } from '@core/api/tms-contracts';
import { API, apiPath } from './api/api.const';
import { mapHttpError } from './http-error';
import { NetworkService } from './network.service';

export interface LoOverviewStats {
  idle: number;
  running: number;
  done: number;
  total: number;
  progressPercent: number;
}

const OVERVIEW_CONCURRENCY = 6;

@Injectable({ providedIn: 'root' })
export class AnalyticsOverviewService {
  private cache = new Map<string, Observable<AnalyticsOverviewResponse>>();
  private overviewInFlight = 0;
  private overviewWaitQueue: Array<() => void> = [];

  constructor(private network: NetworkService) {}

  loadSubjectOverview(subjectId: number): Observable<AnalyticsOverviewResponse> {
    return this.cached(`subject:${subjectId}`, () =>
      this.network.get<AnalyticsOverviewResponse>(apiPath(API.Analytics.SubjectOverview, { id: subjectId })).pipe(
        catchError(mapHttpError),
      ),
    );
  }

  loadSubjectStats(subjectId: number): Observable<LoOverviewStats> {
    return this.loadSubjectOverview(subjectId).pipe(
      map((overview) => this.toLoStats(overview)),
      catchError(() => of(this.emptyLoStats())),
    );
  }

  loadProjectOverview(projectId: number): Observable<AnalyticsOverviewResponse> {
    return this.cached(`project:${projectId}`, () =>
      this.network.get<AnalyticsOverviewResponse>(apiPath(API.Analytics.ProjectOverview, { id: projectId })).pipe(
        catchError(mapHttpError),
      ),
    );
  }

  loadSprintOverview(sprintId: number): Observable<AnalyticsOverviewResponse> {
    return this.cached(`sprint:${sprintId}`, () =>
      this.network.get<AnalyticsOverviewResponse>(apiPath(API.Analytics.SprintOverview, { id: sprintId })).pipe(
        catchError(mapHttpError),
      ),
    );
  }

  loadSprintStats(sprintId: number): Observable<LoOverviewStats> {
    return this.loadSprintOverview(sprintId).pipe(
      map((overview) => this.toLoStats(overview)),
      catchError(() => of(this.emptyLoStats())),
    );
  }

  loadSubjectOverviews(subjectIds: number[]): Observable<Map<number, LoOverviewStats>> {
    const uniqueIds = [...new Set(subjectIds)];
    if (!uniqueIds.length) {
      return of(new Map());
    }

    return forkJoin(
      uniqueIds.map((subjectId) =>
        this.loadSubjectStats(subjectId).pipe(map((stats) => ({ subjectId, stats }))),
      ),
    ).pipe(map((rows) => new Map(rows.map((row) => [row.subjectId, row.stats]))));
  }

  loadProjectOverviews(projectIds: number[]): Observable<Map<number, LoOverviewStats>> {
    const uniqueIds = [...new Set(projectIds)];
    if (!uniqueIds.length) {
      return of(new Map());
    }

    return forkJoin(
      uniqueIds.map((projectId) =>
        this.loadProjectOverview(projectId).pipe(
          map((overview) => ({
            projectId,
            stats: this.toLoStats(overview),
          })),
          catchError(() => of({ projectId, stats: this.emptyLoStats() })),
        ),
      ),
    ).pipe(
      map((rows) => new Map(rows.map((row) => [row.projectId, row.stats]))),
    );
  }

  toLoStats(overview: AnalyticsOverviewResponse): LoOverviewStats {
    return {
      idle: overview.idleLearningObjectives,
      running: overview.runningLearningObjectives,
      done: overview.doneLearningObjectives,
      total: overview.totalLearningObjectives,
      progressPercent: overview.progressPercent,
    };
  }

  invalidate(): void {
    this.cache.clear();
  }

  private cached(key: string, factory: () => Observable<AnalyticsOverviewResponse>): Observable<AnalyticsOverviewResponse> {
    const existing = this.cache.get(key);
    if (existing) {
      return existing;
    }

    const request$ = this.queueOverviewRequest(factory).pipe(shareReplay(1));
    this.cache.set(key, request$);
    return request$;
  }

  private queueOverviewRequest(
    factory: () => Observable<AnalyticsOverviewResponse>,
  ): Observable<AnalyticsOverviewResponse> {
    return defer(
      () =>
        new Observable<AnalyticsOverviewResponse>((subscriber) => {
          const run = () => {
            this.overviewInFlight++;
            factory().subscribe({
              next: (value) => subscriber.next(value),
              error: (err) => {
                this.releaseOverviewSlot();
                subscriber.error(err);
              },
              complete: () => {
                this.releaseOverviewSlot();
                subscriber.complete();
              },
            });
          };

          if (this.overviewInFlight < OVERVIEW_CONCURRENCY) {
            run();
          } else {
            this.overviewWaitQueue.push(run);
          }
        }),
    );
  }

  private releaseOverviewSlot(): void {
    this.overviewInFlight = Math.max(0, this.overviewInFlight - 1);
    const next = this.overviewWaitQueue.shift();
    if (next) {
      next();
    }
  }

  private emptyLoStats(): LoOverviewStats {
    return { idle: 0, running: 0, done: 0, total: 0, progressPercent: 0 };
  }
}
