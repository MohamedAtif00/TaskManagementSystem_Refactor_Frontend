import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { toast } from 'ngx-sonner';
import { ROUTE_PATHS } from '@core/navigation/route-paths.const';
import { PageHeaderComponent } from '@shared/component/page-header/page-header.component';
import { TaskSubjectEntity } from '../domain/entity/task-list.entity';
import { TaskFilterOptionsUseCase } from '../domain/usecase/task-filter-options.usecase';
import { TaskListUseCase } from '../domain/usecase/task-list.usecase';

@Component({
  selector: 'app-task-list',
  imports: [FormsModule, PageHeaderComponent],
  templateUrl: './task-list.component.html',
})
export class TaskListComponent implements OnInit {
  search = '';
  year = '';
  term = '';
  readonly years = signal<string[]>([]);
  readonly terms = signal<string[]>([]);
  readonly rows = signal<TaskSubjectEntity[]>([]);

  constructor(
    private taskListUseCase: TaskListUseCase,
    private filterOptionsUseCase: TaskFilterOptionsUseCase,
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

  load(): void {
    this.taskListUseCase
      .execute({ search: this.search, year: this.year, term: this.term })
      .subscribe((rows) => this.rows.set(rows));
  }

  openBoard(row: TaskSubjectEntity): void {
    const preferred = localStorage.getItem('tasks:view');
    const path = preferred === 'sheet' ? ROUTE_PATHS.taskSheet(row.id) : ROUTE_PATHS.taskBoard(row.id);
    void this.router.navigateByUrl(path);
  }
}
