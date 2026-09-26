import { ChangeDetectorRef, Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgApexchartsModule } from 'ng-apexcharts';
import { ApexChart, ApexDataLabels, ApexLegend, ApexNonAxisChartSeries, ApexPlotOptions, ApexXAxis } from 'ng-apexcharts';
import { forkJoin } from 'rxjs';
import { toast } from 'ngx-sonner';
import { API, apiPath } from '@core/network/api/api.const';
import { NetworkService } from '@core/network/network.service';
import { TicketStatsService } from '@core/network/ticket-stats.service';
import { TicketSummaryService } from '@core/network/ticket-summary.service';
import { ROUTE_PATHS } from '@core/navigation/route-paths.const';
import { PageHeaderComponent } from '@shared/component/page-header/page-header.component';
import { ChartSkeletonComponent } from '@shared/component/skeleton/chart-skeleton.component';

@Component({
  selector: 'app-subject-analytics',
  imports: [RouterLink, NgApexchartsModule, PageHeaderComponent, ChartSkeletonComponent],
  templateUrl: './subject-analytics.component.html',
})
export class SubjectAnalyticsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly network = inject(NetworkService);
  private readonly ticketStats = inject(TicketStatsService);
  private readonly ticketSummary = inject(TicketSummaryService);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly loading = signal(true);
  readonly subjectName = signal('Subject');
  readonly kanbanAnalyticsPath = ROUTE_PATHS.kanbanAnalytics;

  pieSeries: ApexNonAxisChartSeries = [];
  pieLabels = ['Idle', 'Running', 'Done'];
  pieChart: ApexChart = { type: 'pie', height: 280, toolbar: { show: false } };
  pieColors = ['#94a3b8', '#e11d48', '#22c55e'];
  pieLegend: ApexLegend = { position: 'bottom' };
  pieDataLabels: ApexDataLabels = { enabled: true };

  barSeries: { name: string; data: number[] }[] = [];
  barChart: ApexChart = { type: 'bar', height: 280, toolbar: { show: false } };
  barXaxis: ApexXAxis = { categories: ['Backlog', 'To Do', 'Doing', 'Done'] };
  barColors = ['#3b82f6'];
  barPlot: ApexPlotOptions = { bar: { borderRadius: 4, columnWidth: '45%' } };
  barDataLabels: ApexDataLabels = { enabled: false };

  ngOnInit(): void {
    const subjectId = Number(this.route.snapshot.paramMap.get('projectId'));
    forkJoin({
      subject: this.network.get<{ id: number; name: string }>(apiPath(API.Curriculum.Subject, { id: subjectId })),
      stats: this.ticketStats.loadSubjectStats(subjectId),
      summary: this.ticketSummary.loadForSubject(subjectId),
    }).subscribe({
      next: ({ subject, stats, summary }) => {
        this.subjectName.set(subject.name);
        const lo = stats.loStats;
        this.pieSeries = [lo.idle, lo.running, lo.done];
        this.barSeries = [
          {
            name: 'Tasks',
            data: [summary.backlog, summary.toDo, summary.doing, summary.done],
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
