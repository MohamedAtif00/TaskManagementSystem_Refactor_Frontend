import { ChangeDetectorRef, Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgApexchartsModule } from 'ng-apexcharts';
import { ApexChart, ApexDataLabels, ApexLegend, ApexNonAxisChartSeries, ApexPlotOptions, ApexXAxis } from 'ng-apexcharts';
import { forkJoin, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { toast } from 'ngx-sonner';
import { API, apiPath } from '@core/network/api/api.const';
import { NetworkService } from '@core/network/network.service';
import { TicketStatsService } from '@core/network/ticket-stats.service';
import { TicketSummaryService } from '@core/network/ticket-summary.service';
import { ROUTE_PATHS } from '@core/navigation/route-paths.const';
import { PageHeaderComponent } from '@shared/component/page-header/page-header.component';
import { ChartSkeletonComponent } from '@shared/component/skeleton/chart-skeleton.component';

@Component({
  selector: 'app-sprint-analytics',
  imports: [RouterLink, NgApexchartsModule, PageHeaderComponent, ChartSkeletonComponent],
  templateUrl: './sprint-analytics.component.html',
})
export class SprintAnalyticsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly network = inject(NetworkService);
  private readonly ticketStats = inject(TicketStatsService);
  private readonly ticketSummary = inject(TicketSummaryService);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly loading = signal(true);
  readonly sprintName = signal('Sprint');
  readonly sprintAnalyticsPath = ROUTE_PATHS.sprintAnalytics;

  pieSeries: ApexNonAxisChartSeries = [];
  pieLabels = ['Backlog', 'To Do', 'Doing', 'Done'];
  pieChart: ApexChart = { type: 'pie', height: 280, toolbar: { show: false } };
  pieColors = ['#cbd5e1', '#3b82f6', '#f59e0b', '#22c55e'];
  pieLegend: ApexLegend = { position: 'bottom' };
  pieDataLabels: ApexDataLabels = { enabled: true };

  barSeries: { name: string; data: number[] }[] = [];
  barChart: ApexChart = { type: 'bar', height: 280, toolbar: { show: false } };
  barXaxis: ApexXAxis = { categories: [] };
  barColors = ['#8b5cf6'];
  barPlot: ApexPlotOptions = { bar: { borderRadius: 4, columnWidth: '45%' } };
  barDataLabels: ApexDataLabels = { enabled: false };

  ngOnInit(): void {
    const sprintId = Number(this.route.snapshot.paramMap.get('sprintId'));
    this.network
      .get<{ id: number; name: string; learningObjectiveIds?: number[] }>(
        apiPath(API.Sprints.ById, { id: sprintId }),
      )
      .pipe(
        switchMap((sprint) => {
          const loIds$ = sprint.learningObjectiveIds
            ? of(sprint.learningObjectiveIds)
            : this.network
                .get<number[]>(apiPath(API.Sprints.LearningObjectives, { id: sprintId }))
                .pipe(catchError(() => of([] as number[])));

          return forkJoin({
            sprint: of(sprint),
            loIds: loIds$,
            summary: this.ticketSummary.loadForSprint(sprintId),
          });
        }),
        switchMap(({ sprint, loIds, summary }) =>
          this.ticketStats.loadLoStats(loIds).pipe(map((loStats) => ({ sprint, summary, loStats }))),
        ),
      )
      .subscribe({
        next: ({ sprint, summary, loStats }) => {
          this.sprintName.set(sprint.name);
          this.pieSeries = [summary.backlog, summary.toDo, summary.doing, summary.done];
          this.barXaxis = { categories: ['Idle', 'Running', 'Done'] };
          this.barSeries = [
            {
              name: 'Learning objectives',
              data: [loStats.idle, loStats.running, loStats.done],
            },
          ];
          this.loading.set(false);
          this.cdr.markForCheck();
        },
        error: (err: Error) => {
          this.loading.set(false);
          toast.error(err.message);
        },
      });
  }
}
