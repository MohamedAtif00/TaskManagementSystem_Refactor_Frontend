import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { toast } from 'ngx-sonner';
import { downloadCsv } from '@core/utils/csv-export';
import { ButtonComponent } from '@shared/component/button/button.component';
import { ROUTE_PATHS } from '@core/navigation/route-paths.const';
import { PageHeaderComponent } from '@shared/component/page-header/page-header.component';
import { PagerComponent } from '@shared/component/pager/pager.component';
import { TableSkeletonComponent } from '@shared/component/skeleton/table-skeleton.component';
import { TaskSubjectEntity, TASK_LIST_PAGE_SIZE } from '../domain/entity/task-list.entity';
import { TaskFilterOptionsUseCase } from '../domain/usecase/task-filter-options.usecase';
import { TaskListUseCase } from '../domain/usecase/task-list.usecase';
import { TaskListRepository } from '../domain/repository/task-list.repository';

@Component({
  selector: 'app-task-list',
  imports: [FormsModule, PageHeaderComponent, ButtonComponent, PagerComponent, TableSkeletonComponent],
  templateUrl: './task-list.component.html',
})
export class TaskListComponent implements OnInit, OnDestroy {
  search = '';
  year = '';
  term = '';
  readonly page = signal(1);
  readonly pageSize = TASK_LIST_PAGE_SIZE;
  readonly totalCount = signal(0);
  readonly loading = signal(true);
  readonly years = signal<string[]>([]);
  readonly terms = signal<string[]>([]);
  readonly rows = signal<TaskSubjectEntity[]>([]);
  private searchTimer?: ReturnType<typeof setTimeout>;

  constructor(
    private taskListUseCase: TaskListUseCase,
    private filterOptionsUseCase: TaskFilterOptionsUseCase,
    private repository: TaskListRepository,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.filterOptionsUseCase.execute().subscribe({
      next: (options) => {
        this.years.set(options.years);
        this.terms.set(options.terms);
      },
      error: (err: Error) => toast.error(err.message),
    });
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
    this.searchTimer = setTimeout(() => this.resetAndLoad(), 300);
  }

  onFilterChange(): void {
    this.resetAndLoad();
  }

  onPageChange(page: number): void {
    this.page.set(page);
    this.load();
  }

  private resetAndLoad(): void {
    this.page.set(1);
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.taskListUseCase
      .execute({
        search: this.search,
        year: this.year,
        term: this.term,
        page: this.page(),
        pageSize: this.pageSize,
      })
      .subscribe({
        next: (page) => {
          this.rows.set(page.items);
          this.totalCount.set(page.totalCount);
          this.loading.set(false);
        },
        error: (err: Error) => {
          this.loading.set(false);
          toast.error(err.message);
        },
      });
  }

  openBoard(row: TaskSubjectEntity): void {
    const preferred = localStorage.getItem('tasks:view');
    const path = preferred === 'sheet' ? ROUTE_PATHS.taskSheet(row.id) : ROUTE_PATHS.taskBoard(row.id);
    void this.router.navigateByUrl(path);
  }

  exportCsv(): void {
    this.repository
      .exportTasks({ search: this.search, year: this.year, term: this.term })
      .subscribe({
        next: (rows) => {
          if (!rows.length) {
            toast.error('Nothing to export');
            return;
          }
          downloadCsv('subjects.csv', rows, [
            { header: 'Name', value: (row) => row.name },
            { header: 'Path', value: (row) => row.folderPath },
            { header: 'Year', value: (row) => row.year },
            { header: 'Term', value: (row) => row.term },
            { header: 'Progress %', value: (row) => row.progressPercent },
          ]);
          toast.success('Subjects exported');
        },
        error: (err: Error) => toast.error(err.message),
      });
  }
}
