import { NgClass } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toast } from 'ngx-sonner';
import { ROUTE_PATHS } from '@core/navigation/route-paths.const';
import { ButtonComponent } from '@shared/component/button/button.component';
import { PageHeaderComponent } from '@shared/component/page-header/page-header.component';
import { TaskDetailsEntity, TaskStatus } from '../../task-board-screen/domain/entity/task-board.entity';
import { GetTaskDetailsUseCase } from '../../task-board-screen/domain/usecase/get-task-details.usecase';
import { TaskDrawerComponent } from '../../task-board-screen/presentation/task-drawer.component';
import { TaskSheetEntity } from '../domain/entity/task-sheet.entity';
import { GetTaskSheetUseCase } from '../domain/usecase/get-task-sheet.usecase';

@Component({
  selector: 'app-task-sheet',
  imports: [NgClass, RouterLink, PageHeaderComponent, ButtonComponent, TaskDrawerComponent],
  templateUrl: './task-sheet.component.html',
})
export class TaskSheetComponent implements OnInit {
  projectId = 0;
  readonly tasksPath = ROUTE_PATHS.tasks;
  readonly sheet = signal<TaskSheetEntity | null>(null);
  readonly selected = signal<TaskDetailsEntity | null>(null);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private sheetUseCase: GetTaskSheetUseCase,
    private detailsUseCase: GetTaskDetailsUseCase,
  ) {}

  ngOnInit(): void {
    this.projectId = Number(this.route.snapshot.paramMap.get('projectId'));
    localStorage.setItem('tasks:view', 'sheet');
    this.load();
  }

  load(): void {
    this.sheetUseCase.execute(this.projectId).subscribe({
      next: (sheet) => this.sheet.set(sheet),
      error: (err: Error) => toast.error(err.message),
    });
  }

  chipClass(status: TaskStatus): string {
    switch (status) {
      case 0:
        return 'bg-muted text-muted-foreground';
      case 1:
        return 'bg-violet-500/15 text-violet-700 dark:text-violet-300';
      case 2:
        return 'bg-yellow-500/20 text-yellow-800 dark:text-yellow-300';
      case 3:
        return 'bg-green-500/20 text-green-800 dark:text-green-300';
      default:
        return 'bg-primary/15 text-primary';
    }
  }

  openTask(id: number): void {
    this.detailsUseCase.execute(id).subscribe({
      next: (task) => this.selected.set(task),
      error: (err: Error) => toast.error(err.message),
    });
  }

  onDrawerChanged(): void {
    const id = this.selected()?.id;
    this.load();
    if (id) {
      this.detailsUseCase.execute(id).subscribe((task) => this.selected.set(task));
    }
  }

  closeDrawer(): void {
    this.selected.set(null);
  }

  goBoard(): void {
    localStorage.setItem('tasks:view', 'board');
    void this.router.navigateByUrl(ROUTE_PATHS.taskBoard(this.projectId));
  }
}
