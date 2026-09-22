import { ChangeDetectorRef, Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgApexchartsModule } from 'ng-apexcharts';
import { ApexChart, ApexDataLabels, ApexLegend, ApexNonAxisChartSeries, ApexPlotOptions, ApexXAxis } from 'ng-apexcharts';
import { toast } from 'ngx-sonner';
import { API, apiPath } from '@core/network/api/api.const';
import { NetworkService } from '@core/network/network.service';
import { TicketStatsService } from '@core/network/ticket-stats.service';
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
  private readonly cdr = inject(ChangeDetectorRef);

  readonly loading = signal(true);
  readonly subjectName = signal('Subject');
  readonly reportsPath = ROUTE_PATHS.reports;

  pieSeries: ApexNonAxisChartSeries = [];
  pieLabels = ['Idle', 'Running', 'Done'];
  pieChart: ApexChart = { type: 'pie', height: 280, toolbar: { show: false } };
  pieColors = ['#94a3b8', '#e11d48', '#22c55e'];
  pieLegend: ApexLegend = { position: 'bottom' };
  pieDataLabels: ApexDataLabels = { enabled: true };

  barSeries: { name: string; data: number[] }[] = [];
  barChart: ApexChart = { type: 'bar', height: 280, toolbar: { show: false } };
  barXaxis: ApexXAxis = { categories: ['To Do', 'Doing', 'Done', 'Rollback'] };
  barColors = ['#3b82f6'];
  barPlot: ApexPlotOptions = { bar: { borderRadius: 4, columnWidth: '45%' } };
  barDataLabels: ApexDataLabels = { enabled: false };

  ngOnInit(): void {
    const projectId = Number(this.route.snapshot.paramMap.get('projectId'));
    this.network.get<{ id: number; name: string }>(apiPath(API.Curriculum.Subject, { id: projectId })).subscribe({
      next: (subject) => this.subjectName.set(subject.name),
      error: () => this.subjectName.set(`Subject ${projectId}`),
    });
    this.ticketStats.loadSubjectStats(projectId).subscribe({
      next: (stats) => {
        const lo = stats.loStats;
        this.pieSeries = [lo.idle, lo.running, lo.done];
        const statusCounts = [0, 0, 0, 0];
        for (const ticket of stats.tickets) {
          if (ticket.status >= 0 && ticket.status <= 3) {
            statusCounts[ticket.status] += 1;
          }
        }
        this.barSeries = [{ name: 'Tasks', data: statusCounts }];
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
