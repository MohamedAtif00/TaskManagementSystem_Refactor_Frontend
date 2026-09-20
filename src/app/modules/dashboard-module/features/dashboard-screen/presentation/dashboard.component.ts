import { ChangeDetectorRef, Component, OnInit, signal } from '@angular/core';
import { NgApexchartsModule } from 'ng-apexcharts';
import {
  ApexChart,
  ApexDataLabels,
  ApexLegend,
  ApexNonAxisChartSeries,
  ApexPlotOptions,
  ApexXAxis,
} from 'ng-apexcharts';
import { AuthService } from '@core/services/auth.service';
import { UserRole } from '@core/models/user-role';
import { PageHeaderComponent } from '@shared/component/page-header/page-header.component';
import { StatCardComponent } from '@shared/component/stat-card/stat-card.component';
import { ChartCardComponent } from '@shared/component/chart-card/chart-card.component';
import { DashboardEntity } from '../domain/entity/dashboard.entity';
import { DashboardUseCase } from '../domain/usecase/dashboard.usecase';

@Component({
  selector: 'app-dashboard',
  imports: [NgApexchartsModule, PageHeaderComponent, StatCardComponent, ChartCardComponent],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  readonly UserRole = UserRole;
  readonly data = signal<DashboardEntity | null>(null);

  pieSeries: ApexNonAxisChartSeries = [];
  pieLabels: string[] = ['Idle', 'Running', 'Done'];
  pieChart: ApexChart = { type: 'pie', height: 280, toolbar: { show: false } };
  pieColors = ['#94a3b8', '#e11d48', '#22c55e'];
  pieLegend: ApexLegend = { position: 'bottom' };
  pieDataLabels: ApexDataLabels = { enabled: true };

  barSeries: { name: string; data: number[] }[] = [];
  barChart: ApexChart = { type: 'bar', height: 280, toolbar: { show: false } };
  barXaxis: ApexXAxis = { categories: [] };
  barColors = ['#e11d48'];
  barPlot: ApexPlotOptions = { bar: { borderRadius: 4, columnWidth: '45%' } };
  barDataLabels: ApexDataLabels = { enabled: false };

  constructor(
    public authService: AuthService,
    private dashboardUseCase: DashboardUseCase,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const role = this.authService.user()?.role;
    if (role === undefined) {
      return;
    }

    this.dashboardUseCase.execute(role).subscribe((result) => {
      this.data.set(result);
      this.buildCharts(result);
      this.cdr.markForCheck();
    });
  }

  private buildCharts(result: DashboardEntity): void {
    const pm = result.projectManager;
    if (!pm) {
      return;
    }

    const idle = pm.projectsReport.reduce((sum, item) => sum + item.idleLearningObjectives, 0);
    const running = pm.projectsReport.reduce((sum, item) => sum + item.runningLearningObjectives, 0);
    const done = pm.projectsReport.reduce((sum, item) => sum + item.doneLearningObjectives, 0);
    this.pieSeries = [idle, running, done];

    this.barXaxis = { categories: pm.groupsCount.map((group) => group.name) };
    this.barSeries = [{ name: 'Users', data: pm.groupsCount.map((group) => group.usersCount) }];
  }
}
