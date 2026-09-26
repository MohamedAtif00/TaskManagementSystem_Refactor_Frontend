import { HttpParams } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { toast } from 'ngx-sonner';
import { DEFAULT_PAGE_SIZE } from '@core/models/list-page.model';
import { API, apiPath } from '@core/network/api/api.const';
import { mapHttpError } from '@core/network/http-error';
import { NetworkService } from '@core/network/network.service';
import { TicketSummaryService } from '@core/network/ticket-summary.service';
import { ROUTE_PATHS } from '@core/navigation/route-paths.const';
import { PageHeaderComponent } from '@shared/component/page-header/page-header.component';
import { PagerComponent } from '@shared/component/pager/pager.component';
import { TableSkeletonComponent } from '@shared/component/skeleton/table-skeleton.component';

interface SprintAnalyticsRow {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  loNumber: number;
  progressPercent: number;
}

interface SprintDto {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  learningObjectiveIds?: number[];
}

@Component({
  selector: 'app-sprint-analytics-list',
  imports: [RouterLink, PageHeaderComponent, TableSkeletonComponent, PagerComponent],
  templateUrl: './sprint-analytics-list.component.html',
})
export class SprintAnalyticsListComponent implements OnInit {
  private readonly network = inject(NetworkService);
  private readonly ticketSummary = inject(TicketSummaryService);

  readonly loading = signal(true);
  readonly rows = signal<SprintAnalyticsRow[]>([]);
  readonly page = signal(1);
  readonly pageSize = DEFAULT_PAGE_SIZE;
  readonly totalCount = signal(0);
  readonly sprintsPath = ROUTE_PATHS.sprints;

  private allSprints: SprintDto[] = [];

  ngOnInit(): void {
    this.load();
  }

  onPageChange(page: number): void {
    this.page.set(page);
    this.loadPageRows();
  }

  load(): void {
    this.loading.set(true);
    const httpParams = new HttpParams().set('archived', 'false');
    this.network
      .get<SprintDto[]>(API.Sprints.List, httpParams)
      .pipe(catchError(mapHttpError))
      .subscribe({
        next: (sprints) => {
          this.allSprints = sprints;
          this.totalCount.set(sprints.length);
          this.loadPageRows();
        },
        error: (err: Error) => {
          this.loading.set(false);
          toast.error(err.message);
        },
      });
  }

  private loadPageRows(): void {
    const start = (this.page() - 1) * this.pageSize;
    const slice = this.allSprints.slice(start, start + this.pageSize);
    if (!slice.length) {
      this.rows.set([]);
      this.loading.set(false);
      return;
    }

    forkJoin(
      slice.map((sprint) => {
        const loCount$ = sprint.learningObjectiveIds
          ? of(sprint.learningObjectiveIds.length)
          : this.network
              .get<number[]>(apiPath(API.Sprints.LearningObjectives, { id: sprint.id }))
              .pipe(catchError(() => of([] as number[])), map((ids) => ids.length));

        return loCount$.pipe(
          switchMap((loNumber) =>
            this.ticketSummary.loadForSprint(sprint.id).pipe(
              catchError(() => of({ backlog: 0, toDo: 0, doing: 0, done: 0, totalCount: 0, calculatedAtUtc: '' })),
              map((summary) => ({
                id: sprint.id,
                name: sprint.name,
                startDate: String(sprint.startDate).slice(0, 10),
                endDate: String(sprint.endDate).slice(0, 10),
                loNumber,
                progressPercent: summary.totalCount
                  ? Math.round((summary.done / summary.totalCount) * 100)
                  : 0,
              })),
            ),
          ),
        );
      }),
    ).subscribe({
      next: (rows) => {
        this.rows.set(rows);
        this.loading.set(false);
      },
      error: (err: Error) => {
        this.loading.set(false);
        toast.error(err.message);
      },
    });
  }

  analyticsPath(sprintId: number): string {
    return ROUTE_PATHS.sprintAnalyticsDetail(sprintId);
  }
}
