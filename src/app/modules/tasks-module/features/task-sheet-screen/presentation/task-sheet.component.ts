import { NgClass } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toast } from 'ngx-sonner';
import { LoCodeDisplayService } from '@core/lo-code/lo-code-display.service';
import { ROUTE_PATHS } from '@core/navigation/route-paths.const';
import { ButtonComponent } from '@shared/component/button/button.component';
import { LoCodeDisplayToggleComponent } from '@shared/component/lo-code-display-toggle/lo-code-display-toggle.component';
import { PageHeaderComponent } from '@shared/component/page-header/page-header.component';
import { TableSkeletonComponent } from '@shared/component/skeleton/table-skeleton.component';
import { LoCodeLabelPipe } from '@shared/pipes/lo-code-label.pipe';
import { TaskDetailsEntity, TaskStatus } from '../../task-board-screen/domain/entity/task-board.entity';
import { GetTaskDetailsUseCase } from '../../task-board-screen/domain/usecase/get-task-details.usecase';
import { TaskDrawerComponent } from '../../task-board-screen/presentation/task-drawer.component';
import { TaskSheetEntity } from '../domain/entity/task-sheet.entity';
import { GetTaskSheetUseCase } from '../domain/usecase/get-task-sheet.usecase';

@Component({
  selector: 'app-task-sheet',
  imports: [NgClass, RouterLink, PageHeaderComponent, LoCodeDisplayToggleComponent, ButtonComponent, TaskDrawerComponent, TableSkeletonComponent, LoCodeLabelPipe],
  templateUrl: './task-sheet.component.html',
})
export class TaskSheetComponent implements OnInit {
  readonly loDisplay = inject(LoCodeDisplayService);
  projectId = 0;
  readonly tasksPath = ROUTE_PATHS.tasks;
  readonly loading = signal(true);
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
    this.loading.set(true);
    this.sheetUseCase.execute(this.projectId).subscribe({
      next: (sheet) => {
        this.sheet.set(sheet);
        this.loading.set(false);
      },
      error: (err: Error) => {
        this.loading.set(false);
        toast.error(err.message);
      },
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
    this.refreshSheet();
    if (id) {
      this.detailsUseCase.execute(id).subscribe((task) => this.selected.set(task));
    }
  }

  private refreshSheet(): void {
    this.sheetUseCase.execute(this.projectId).subscribe({
      next: (sheet) => this.sheet.set(sheet),
      error: (err: Error) => toast.error(err.message),
    });
  }

  closeDrawer(): void {
    this.selected.set(null);
  }

  goBoard(): void {
    localStorage.setItem('tasks:view', 'board');
    void this.router.navigateByUrl(ROUTE_PATHS.taskBoard(this.projectId));
  }
}
