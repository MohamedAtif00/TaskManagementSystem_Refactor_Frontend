import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { toast } from 'ngx-sonner';
import { CurriculumCatalogService, YearTree } from '@core/network/curriculum-catalog.service';
import { TicketStatsService } from '@core/network/ticket-stats.service';
import { ROUTE_PATHS } from '@core/navigation/route-paths.const';
import { PageHeaderComponent } from '@shared/component/page-header/page-header.component';
import { TableSkeletonComponent } from '@shared/component/skeleton/table-skeleton.component';

interface KanbanAnalyticsRow {
  id: number;
  name: string;
  projectName: string;
  progressPercent: number;
}

@Component({
  selector: 'app-kanban-analytics-list',
  imports: [RouterLink, PageHeaderComponent, TableSkeletonComponent],
  templateUrl: './kanban-analytics-list.component.html',
})
export class KanbanAnalyticsListComponent implements OnInit {
  private readonly catalog = inject(CurriculumCatalogService);
  private readonly ticketStats = inject(TicketStatsService);

  readonly loading = signal(true);
  readonly rows = signal<KanbanAnalyticsRow[]>([]);
  readonly reportsPath = ROUTE_PATHS.reports;

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.catalog.getTrees().pipe(catchError(() => of([] as YearTree[]))).subscribe({
      next: (trees) => {
        const subjects = this.collectSubjects(trees);
        const subjectIds = subjects.map((subject) => subject.id);
        this.ticketStats.aggregateForSubjects(subjectIds).subscribe({
          next: (stats) => {
            this.rows.set(
              subjects.map((subject) => {
                const loStats = stats.bySubject.get(subject.id)?.loStats ?? { idle: 0, running: 0, done: 0, total: 0 };
                return {
                  id: subject.id,
                  name: subject.name,
                  projectName: subject.projectName,
                  progressPercent: loStats.total ? Math.round((loStats.done / loStats.total) * 100) : 0,
                };
              }),
            );
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

  private collectSubjects(trees: YearTree[]): Array<{ id: number; name: string; projectName: string }> {
    const rows: Array<{ id: number; name: string; projectName: string }> = [];
    for (const tree of trees) {
      for (const project of tree.projects ?? []) {
        for (const term of project.terms ?? []) {
          for (const group of term.subjectGroups ?? []) {
            for (const subject of group.subjects ?? []) {
              rows.push({ id: subject.id, name: subject.name, projectName: project.name });
            }
          }
        }
      }
    }
    return rows;
  }
}
