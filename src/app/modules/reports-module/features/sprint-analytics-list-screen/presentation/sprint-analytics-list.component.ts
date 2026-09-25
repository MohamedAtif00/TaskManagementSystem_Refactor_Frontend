import { HttpParams } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { toast } from 'ngx-sonner';
import { API, apiPath } from '@core/network/api/api.const';
import { mapHttpError } from '@core/network/http-error';
import { NetworkService } from '@core/network/network.service';
import { TicketStatsService } from '@core/network/ticket-stats.service';
import { ROUTE_PATHS } from '@core/navigation/route-paths.const';
import { PageHeaderComponent } from '@shared/component/page-header/page-header.component';
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
  imports: [RouterLink, PageHeaderComponent, TableSkeletonComponent],
  templateUrl: './sprint-analytics-list.component.html',
})
export class SprintAnalyticsListComponent implements OnInit {
  private readonly network = inject(NetworkService);
  private readonly ticketStats = inject(TicketStatsService);

  readonly loading = signal(true);
  readonly rows = signal<SprintAnalyticsRow[]>([]);
  readonly sprintsPath = ROUTE_PATHS.sprints;

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    const httpParams = new HttpParams().set('archived', 'false');
    this.network
      .get<SprintDto[]>(API.Sprints.List, httpParams)
      .pipe(
        switchMap((sprints) => {
          if (!sprints.length) {
            return of([] as SprintAnalyticsRow[]);
          }
          return forkJoin(sprints.map((sprint) => this.toRow(sprint)));
        }),
        catchError(mapHttpError),
      )
      .subscribe({
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

  private toRow(sprint: SprintDto) {
    const ids$ = sprint.learningObjectiveIds
      ? of(sprint.learningObjectiveIds)
      : this.network.get<number[]>(apiPath(API.Sprints.LearningObjectives, { id: sprint.id })).pipe(catchError(() => of([] as number[])));

    return ids$.pipe(
      switchMap((ids) =>
        this.ticketStats.progressForLos(ids).pipe(
          catchError(() => of(0)),
          map((progressPercent) => ({
            id: sprint.id,
            name: sprint.name,
            startDate: String(sprint.startDate).slice(0, 10),
            endDate: String(sprint.endDate).slice(0, 10),
            loNumber: ids.length,
            progressPercent,
          })),
        ),
      ),
    );
  }
}
