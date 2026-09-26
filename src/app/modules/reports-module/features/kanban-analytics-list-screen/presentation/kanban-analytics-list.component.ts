import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
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
  selector: 'app-kanban-analytics-list',
  imports: [FormsModule, RouterLink, PageHeaderComponent, TableSkeletonComponent, PagerComponent],
  templateUrl: './kanban-analytics-list.component.html',
})
export class KanbanAnalyticsListComponent implements OnInit, OnDestroy {
  private readonly catalog = inject(ReportsSubjectCatalogService);
  private readonly ticketStats = inject(TicketStatsService);

  search = '';
  private searchTimer?: ReturnType<typeof setTimeout>;
  private loadGeneration = 0;

  readonly loading = signal(true);
  readonly progressLoading = signal(false);
  readonly rows = signal<ReportSubjectStatsRow[]>([]);
  readonly page = signal(1);
  readonly pageSize = DEFAULT_PAGE_SIZE;
  readonly totalCount = signal(0);
  readonly reportsPath = ROUTE_PATHS.reports;

  ngOnInit(): void {
    this.load();
  }

  ngOnDestroy(): void {
    if (this.searchTimer) {
      clearTimeout(this.searchTimer);
    }
  }

  onSearchChange(): void {
    if (this.searchTimer) {
      clearTimeout(this.searchTimer);
    }
    this.searchTimer = setTimeout(() => {
      this.page.set(1);
      this.load();
    }, 300);
  }

  onPageChange(page: number): void {
    this.page.set(page);
    this.load();
  }

  load(): void {
    const generation = ++this.loadGeneration;
    this.loading.set(true);
    this.progressLoading.set(false);

    this.catalog
      .loadPage({ page: this.page(), pageSize: this.pageSize, search: this.search })
      .subscribe({
        next: (page) => {
          if (generation !== this.loadGeneration) {
            return;
          }

          this.totalCount.set(page.totalCount);
          const ids = page.items.map((item) => item.id);

          if (!ids.length) {
            this.rows.set([]);
            this.loading.set(false);
            return;
          }

          this.rows.set(page.items.map((item) => mergeSubjectStats(item)));
          this.loading.set(false);
          this.progressLoading.set(true);

          this.ticketStats.aggregateForSubjects(ids).subscribe({
            next: (aggregate) => {
              if (generation !== this.loadGeneration) {
                return;
              }
              this.rows.set(
                page.items.map((item) => {
                  const subjectStats = aggregate.bySubject.get(item.id);
                  return mergeSubjectStats(item, subjectStats?.loStats, subjectStats?.progressPercent);
                }),
              );
              this.progressLoading.set(false);
            },
            error: (err: Error) => {
              if (generation !== this.loadGeneration) {
                return;
              }
              this.progressLoading.set(false);
              toast.error(err.message);
            },
          });
        },
        error: (err: Error) => {
          if (generation !== this.loadGeneration) {
            return;
          }
          this.loading.set(false);
          this.progressLoading.set(false);
          toast.error(err.message);
        },
      });
  }

  analyticsPath(subjectId: number): string {
    return ROUTE_PATHS.subjectAnalytics(subjectId);
  }
}
