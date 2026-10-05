import { NgClass } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { toast } from 'ngx-sonner';
import { LoCodeDisplayService } from '@core/lo-code/lo-code-display.service';
import { ROUTE_PATHS } from '@core/navigation/route-paths.const';
import { downloadCsv } from '@core/utils/csv-export';
import { ButtonComponent } from '@shared/component/button/button.component';
import { LoCodeDisplayToggleComponent } from '@shared/component/lo-code-display-toggle/lo-code-display-toggle.component';
import { PageHeaderComponent } from '@shared/component/page-header/page-header.component';
import { PagerComponent } from '@shared/component/pager/pager.component';
import { TableSkeletonComponent } from '@shared/component/skeleton/table-skeleton.component';
import { LoCodeLabelPipe } from '@shared/pipes/lo-code-label.pipe';
import { BoardSource, TaskDetailsEntity, TaskStatus, TASK_STATUS_LABELS } from '../../task-board-screen/domain/entity/task-board.entity';
import { GetTaskDetailsUseCase } from '../../task-board-screen/domain/usecase/get-task-details.usecase';
import { TaskDrawerComponent } from '../../task-board-screen/presentation/task-drawer.component';
import { SheetUnitEntity, TaskSheetEntity } from '../domain/entity/task-sheet.entity';
import { GetTaskSheetUseCase } from '../domain/usecase/get-task-sheet.usecase';

@Component({
  selector: 'app-task-sheet',
  imports: [NgClass, PageHeaderComponent, LoCodeDisplayToggleComponent, ButtonComponent, TaskDrawerComponent, TableSkeletonComponent, LoCodeLabelPipe, PagerComponent],
  templateUrl: './task-sheet.component.html',
})
export class TaskSheetComponent implements OnInit {
  readonly loDisplay = inject(LoCodeDisplayService);
  readonly pageSize = 10;
  readonly loading = signal(true);
  readonly sheet = signal<TaskSheetEntity | null>(null);
  readonly page = signal(1);
  readonly selected = signal<TaskDetailsEntity | null>(null);
  readonly learningObjectiveCount = computed(() => countLearningObjectives(this.sheet()));
  readonly pagedUnits = computed(() => pageSheetUnits(this.sheet(), this.page(), this.pageSize));

  source: BoardSource = 'project';
  entityId = 0;

  readonly backLink = computed(() => (this.source === 'project' ? ROUTE_PATHS.tasks : ROUTE_PATHS.sprints));
  readonly sheetSubtitle = computed(() => (this.source === 'project' ? 'Curriculum sheet' : 'Sprint sheet'));
  readonly boardPath = computed(() =>
    this.source === 'project' ? ROUTE_PATHS.taskBoard(this.entityId) : ROUTE_PATHS.sprintBoard(this.entityId),
  );

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private sheetUseCase: GetTaskSheetUseCase,
    private detailsUseCase: GetTaskDetailsUseCase,
  ) {}

  ngOnInit(): void {
    const projectId = this.route.snapshot.paramMap.get('projectId');
    const sprintId = this.route.snapshot.paramMap.get('sprintId');
    this.source = projectId ? 'project' : 'sprint';
    this.entityId = Number(projectId ?? sprintId);
    if (this.source === 'project') {
      localStorage.setItem('tasks:view', 'sheet');
    }
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.sheetUseCase.execute({ source: this.source, id: this.entityId }).subscribe({
      next: (sheet) => {
        this.placeSheet(sheet, true);
        this.loading.set(false);
      },
      error: (err: Error) => {
        this.loading.set(false);
        toast.error(err.message);
      },
    });
  }

  onPageChange(page: number): void {
    this.page.set(page);
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

  exportSheet(): void {
    const current = this.sheet();
    if (!current) {
      toast.error('Nothing to export');
      return;
    }
    const rows = current.units.flatMap((unit) =>
      unit.lessons.flatMap((lesson) =>
        lesson.learningObjectives.flatMap((lo) =>
          lo.tasks.map((task) => ({
            unit: unit.name,
            lesson: lesson.name,
            lo: lo.name,
            task: task.name,
            status: TASK_STATUS_LABELS[task.status],
            assignee: task.user?.name ?? '',
          })),
        ),
      ),
    );
    if (!rows.length) {
      toast.error('No tasks to export');
      return;
    }
    downloadCsv(`${current.name}-sheet.csv`, rows, [
      { header: 'Unit', value: (row) => row.unit },
      { header: 'Lesson', value: (row) => row.lesson },
      { header: 'Learning objective', value: (row) => row.lo },
      { header: 'Task', value: (row) => row.task },
      { header: 'Status', value: (row) => row.status },
      { header: 'Assignee', value: (row) => row.assignee },
    ]);
    toast.success('Sheet exported');
  }

  private placeSheet(sheet: TaskSheetEntity, resetPage: boolean): void {
    this.sheet.set(sheet);
    const lastPage = Math.max(1, Math.ceil(countLearningObjectives(sheet) / this.pageSize));
    if (resetPage || this.page() > lastPage) {
      this.page.set(resetPage ? 1 : lastPage);
    }
  }

  private refreshSheet(): void {
    this.sheetUseCase.execute({ source: this.source, id: this.entityId }).subscribe({
      next: (sheet) => this.placeSheet(sheet, false),
      error: (err: Error) => toast.error(err.message),
    });
  }

  closeDrawer(): void {
    this.selected.set(null);
  }

  goBoard(): void {
    if (this.source === 'project') {
      localStorage.setItem('tasks:view', 'board');
    }
    void this.router.navigateByUrl(this.boardPath());
  }
}

function countLearningObjectives(sheet: TaskSheetEntity | null): number {
  if (!sheet) {
    return 0;
  }
  return sheet.units.reduce(
    (total, unit) => total + unit.lessons.reduce((lessonTotal, lesson) => lessonTotal + lesson.learningObjectives.length, 0),
    0,
  );
}

function pageSheetUnits(sheet: TaskSheetEntity | null, page: number, pageSize: number): SheetUnitEntity[] {
  if (!sheet) {
    return [];
  }
  const rows = sheet.units.flatMap((unit) =>
    unit.lessons.flatMap((lesson) =>
      lesson.learningObjectives.map((learningObjective) => ({ unit, lesson, learningObjective })),
    ),
  );
  const start = Math.max(0, (page - 1) * pageSize);
  const slice = rows.slice(start, start + pageSize);
  const units: SheetUnitEntity[] = [];
  for (const row of slice) {
    let unit = units.at(-1);
    if (!unit || unit.id !== row.unit.id) {
      unit = { id: row.unit.id, name: row.unit.name, lessons: [] };
      units.push(unit);
    }
    let lesson = unit.lessons.at(-1);
    if (!lesson || lesson.id !== row.lesson.id) {
      lesson = { id: row.lesson.id, name: row.lesson.name, learningObjectives: [] };
      unit.lessons.push(lesson);
    }
    lesson.learningObjectives.push(row.learningObjective);
  }
  return units;
}
