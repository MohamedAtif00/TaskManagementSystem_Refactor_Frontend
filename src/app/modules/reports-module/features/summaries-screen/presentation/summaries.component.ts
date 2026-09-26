import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { toast } from 'ngx-sonner';
import { DEFAULT_PAGE_SIZE } from '@core/models/list-page.model';
import { TicketStatsService } from '@core/network/ticket-stats.service';
import { ROUTE_PATHS } from '@core/navigation/route-paths.const';
import { PageHeaderComponent } from '@shared/component/page-header/page-header.component';
import { PagerComponent } from '@shared/component/pager/pager.component';
import { TableSkeletonComponent } from '@shared/component/skeleton/table-skeleton.component';
import { ReportsSubjectCatalogService } from '../../../shared/reports-subject-catalog.service';
import { mergeSubjectStats, ReportSubjectStatsRow } from '../../../shared/reports-subject-row.model';

@Component({
  selector: 'app-summaries',
  imports: [RouterLink, PageHeaderComponent, TableSkeletonComponent, PagerComponent],
  templateUrl: './summaries.component.html',
})
export class SummariesComponent implements OnInit {
  private readonly catalog = inject(ReportsSubjectCatalogService);
  private readonly ticketStats = inject(TicketStatsService);

  readonly loading = signal(true);
  readonly rows = signal<ReportSubjectStatsRow[]>([]);
  readonly page = signal(1);
  readonly pageSize = DEFAULT_PAGE_SIZE;
  readonly totalCount = signal(0);
  readonly reportsPath = ROUTE_PATHS.reports;

  ngOnInit(): void {
    this.load();
  }

  onPageChange(page: number): void {
    this.page.set(page);
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.catalog.loadPage({ page: this.page(), pageSize: this.pageSize }).subscribe({
      next: (page) => {
        const ids = page.items.map((item) => item.id);
        if (!ids.length) {
          this.rows.set([]);
          this.totalCount.set(page.totalCount);
          this.loading.set(false);
          return;
        }
        this.ticketStats.aggregateForSubjects(ids).subscribe({
          next: (aggregate) => {
            this.rows.set(
              page.items.map((item) => {
                const subjectStats = aggregate.bySubject.get(item.id);
                return mergeSubjectStats(item, subjectStats?.loStats, subjectStats?.progressPercent);
              }),
            );
            this.totalCount.set(page.totalCount);
            this.loading.set(false);
          },
          error: (err: Error) => {
            this.loading.set(false);
            toast.error(err.message);
          },
        });
      },
      error: (err: Error) => {
        this.loading.set(false);
        toast.error(err.message);
      },
    });
  }

  analyticsPath(subjectId: number): string {
    return ROUTE_PATHS.subjectAnalytics(subjectId);
  }
}
