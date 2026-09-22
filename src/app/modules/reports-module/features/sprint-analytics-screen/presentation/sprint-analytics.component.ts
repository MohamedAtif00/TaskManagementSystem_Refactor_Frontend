import { ChangeDetectorRef, Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgApexchartsModule } from 'ng-apexcharts';
import { ApexChart, ApexDataLabels, ApexLegend, ApexNonAxisChartSeries, ApexPlotOptions, ApexXAxis } from 'ng-apexcharts';
import { forkJoin } from 'rxjs';
import { toast } from 'ngx-sonner';
import { API, apiPath } from '@core/network/api/api.const';
import { NetworkService } from '@core/network/network.service';
import { ROUTE_PATHS } from '@core/navigation/route-paths.const';
import { PageHeaderComponent } from '@shared/component/page-header/page-header.component';
import { ChartSkeletonComponent } from '@shared/component/skeleton/chart-skeleton.component';

interface SprintTicket {
  id: number;
  status: number;
  learningObjectiveId: number;
}

@Component({
  selector: 'app-sprint-analytics',
  imports: [RouterLink, NgApexchartsModule, PageHeaderComponent, ChartSkeletonComponent],
  templateUrl: './sprint-analytics.component.html',
})
export class SprintAnalyticsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly network = inject(NetworkService);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly loading = signal(true);
  readonly sprintName = signal('Sprint');
  readonly sprintsPath = ROUTE_PATHS.sprints;

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
    forkJoin({
      sprint: this.network.get<{ id: number; name: string; learningObjectiveIds?: number[] }>(
        apiPath(API.Sprints.ById, { id: sprintId }),
      ),
      tickets: this.network.get<SprintTicket[]>(apiPath(API.Tickets.ListBySprint, { id: sprintId })),
    }).subscribe({
      next: ({ sprint, tickets }) => {
        this.sprintName.set(sprint.name);
        const statusCounts = [0, 0, 0, 0];
        const loCounts = new Map<number, number>();
        for (const ticket of tickets) {
          if (ticket.status >= 0 && ticket.status <= 3) {
            statusCounts[ticket.status] += 1;
          }
          loCounts.set(ticket.learningObjectiveId, (loCounts.get(ticket.learningObjectiveId) ?? 0) + 1);
        }
        this.pieSeries = statusCounts;
        this.barXaxis = {
          categories: [...loCounts.keys()].slice(0, 12).map((id) => `LO ${id}`),
        };
        this.barSeries = [{ name: 'Tasks', data: [...loCounts.values()].slice(0, 12) }];
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
