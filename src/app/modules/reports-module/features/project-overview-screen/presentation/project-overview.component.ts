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

interface ProjectOverviewRow {
  id: number;
  name: string;
  year: string;
  term: string;
  idle: number;
  running: number;
  done: number;
  total: number;
  progressPercent: number;
}

@Component({
  selector: 'app-project-overview',
  imports: [RouterLink, PageHeaderComponent, TableSkeletonComponent],
  templateUrl: './project-overview.component.html',
})
export class ProjectOverviewComponent implements OnInit {
  private readonly catalog = inject(CurriculumCatalogService);
  private readonly ticketStats = inject(TicketStatsService);

  readonly loading = signal(true);
  readonly rows = signal<ProjectOverviewRow[]>([]);
  readonly reportsPath = ROUTE_PATHS.reports;

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.catalog.getTrees().pipe(catchError(() => of([] as YearTree[]))).subscribe({
      next: (trees) => {
        const projects = this.catalog.flattenProjects(trees);
        const subjectIds = this.collectSubjectIds(trees);
        this.ticketStats.aggregateForSubjects(subjectIds).subscribe({
          next: (stats) => {
            this.rows.set(
              projects.map((project) => {
                const treeProject = trees.flatMap((tree) => tree.projects ?? []).find((row) => row.id === project.id);
                const projectSubjectIds =
                  treeProject?.terms?.flatMap((term) =>
                    term.subjectGroups?.flatMap((group) => group.subjects?.map((subject) => subject.id) ?? []) ?? [],
                  ) ?? [];
                const loStats = projectSubjectIds.reduce(
                  (acc, subjectId) => {
                    const row = stats.bySubject.get(subjectId)?.loStats ?? { idle: 0, running: 0, done: 0, total: 0 };
                    return {
                      idle: acc.idle + row.idle,
                      running: acc.running + row.running,
                      done: acc.done + row.done,
                      total: acc.total + row.total,
                    };
                  },
                  { idle: 0, running: 0, done: 0, total: 0 },
                );
                return {
                  id: project.id,
                  name: project.name,
                  year: project.year,
                  term: treeProject?.terms?.[0]?.name ?? '—',
                  idle: loStats.idle,
                  running: loStats.running,
                  done: loStats.done,
                  total: loStats.total,
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

  private collectSubjectIds(trees: YearTree[]): number[] {
    const ids: number[] = [];
    for (const tree of trees) {
      for (const project of tree.projects ?? []) {
        for (const term of project.terms ?? []) {
          for (const group of term.subjectGroups ?? []) {
            for (const subject of group.subjects ?? []) {
              ids.push(subject.id);
            }
          }
        }
      }
    }
    return ids;
  }
}
