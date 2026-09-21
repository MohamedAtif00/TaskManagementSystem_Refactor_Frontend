import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { Component, OnDestroy, OnInit, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toast } from 'ngx-sonner';
import { forkJoin, Subscription } from 'rxjs';
import { UserRole } from '@core/models/user-role';
import { ROUTE_PATHS } from '@core/navigation/route-paths.const';
import { AuthService } from '@core/services/auth.service';
import { RealtimeService } from '@core/services/realtime.service';
import { TicketStatsService } from '@core/network/ticket-stats.service';
import { ButtonComponent } from '@shared/component/button/button.component';
import { PageHeaderComponent } from '@shared/component/page-header/page-header.component';
import {
  BoardSource,
  TaskBoardEntity,
  TaskCardEntity,
  TaskColumnPageEntity,
  TaskDetailsEntity,
  TaskStatus,
} from '../domain/entity/task-board.entity';
import { CompleteTaskUseCase } from '../domain/usecase/complete-task.usecase';
import { GetTaskBoardUseCase } from '../domain/usecase/get-task-board.usecase';
import { GetTaskColumnPageUseCase } from '../domain/usecase/get-task-column-page.usecase';
import { GetTaskDetailsUseCase } from '../domain/usecase/get-task-details.usecase';
import { ProceedTaskUseCase } from '../domain/usecase/proceed-task.usecase';
import { NewTaskModalComponent } from './new-task-modal.component';
import { TaskColumnComponent } from './task-column.component';
import { TaskDrawerComponent } from './task-drawer.component';

interface BoardColumn {
  label: string;
  key: string;
  statuses: TaskStatus[];
}

interface ColumnPageState {
  page: number;
  totalCount: number;
  cards: TaskCardEntity[];
}

const COLUMN_PAGE_SIZE = 10;

@Component({
  selector: 'app-task-board',
  imports: [
    FormsModule,
    RouterLink,
    DragDropModule,
    PageHeaderComponent,
    ButtonComponent,
    TaskColumnComponent,
    TaskDrawerComponent,
    NewTaskModalComponent,
  ],
  templateUrl: './task-board.component.html',
})
export class TaskBoardComponent implements OnInit, OnDestroy {
  readonly columns: BoardColumn[] = [
    { label: 'Backlog', key: 'backlog', statuses: [0] },
    { label: 'To Do', key: 'todo', statuses: [1] },
    { label: 'Doing', key: 'doing', statuses: [2] },
    { label: 'Done', key: 'done', statuses: [3, 4] },
  ];
  readonly pageSize = COLUMN_PAGE_SIZE;
  readonly board = signal<TaskBoardEntity | null>(null);
  readonly selected = signal<TaskDetailsEntity | null>(null);
  readonly showCreate = signal(false);
  readonly searchType = signal<'lo' | 'task'>('lo');
  readonly selectedLoId = signal(0);
  readonly taskQuery = signal('');
  readonly columnPages = signal<Record<string, ColumnPageState>>(this.emptyColumnPages());
  source: BoardSource = 'project';
  entityId = 0;
  private ticketUpdates?: Subscription;
  private columnsSub?: Subscription;
  private queryDebounce?: ReturnType<typeof setTimeout>;
  private clamping = new Set<string>();

  readonly backLink = computed(() => (this.source === 'project' ? ROUTE_PATHS.tasks : ROUTE_PATHS.sprints));
  readonly canCreate = computed(
    () => this.source === 'project' && this.auth.user()?.role !== UserRole.Member,
  );

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private auth: AuthService,
    private boardUseCase: GetTaskBoardUseCase,
    private columnPageUseCase: GetTaskColumnPageUseCase,
    private detailsUseCase: GetTaskDetailsUseCase,
    private proceedUseCase: ProceedTaskUseCase,
    private completeUseCase: CompleteTaskUseCase,
    private realtime: RealtimeService,
    private ticketStats: TicketStatsService,
  ) {}

  ngOnInit(): void {
    const projectId = this.route.snapshot.paramMap.get('projectId');
    const sprintId = this.route.snapshot.paramMap.get('sprintId');
    this.source = projectId ? 'project' : 'sprint';
    this.entityId = Number(projectId ?? sprintId);
    if (this.source === 'project') {
      localStorage.setItem('tasks:view', 'board');
    }
    this.load();
    this.ticketUpdates = this.realtime.onTicketUpdated().subscribe(() => {
      this.ticketStats.invalidate();
      this.loadColumns();
    });
  }

  ngOnDestroy(): void {
    this.ticketUpdates?.unsubscribe();
    this.columnsSub?.unsubscribe();
    if (this.queryDebounce) {
      clearTimeout(this.queryDebounce);
    }
  }

  load(): void {
    this.boardUseCase.execute({ source: this.source, id: this.entityId }).subscribe({
      next: (board) => {
        this.board.set(board);
        this.realtime.joinTicketBoard(board.learningObjectives.map((lo) => lo.id));
        this.loadColumns();
      },
      error: (err: Error) => toast.error(err.message),
    });
  }

  cardsFor(column: BoardColumn): TaskCardEntity[] {
    return this.columnPages()[column.key]?.cards ?? [];
  }

  totalFor(column: BoardColumn): number {
    return this.columnPages()[column.key]?.totalCount ?? 0;
  }

  pageFor(column: BoardColumn): number {
    return this.columnPages()[column.key]?.page ?? 1;
  }

  onSearchTypeChange(value: 'lo' | 'task'): void {
    this.searchType.set(value);
    this.resetColumnPages();
    this.loadColumns();
  }

  onLoChange(value: number): void {
    this.selectedLoId.set(value);
    this.resetColumnPages();
    this.loadColumns();
  }

  onTaskQueryChange(value: string): void {
    this.taskQuery.set(value);
    if (this.queryDebounce) {
      clearTimeout(this.queryDebounce);
    }
    this.queryDebounce = setTimeout(() => {
      this.resetColumnPages();
      this.loadColumns();
    }, 300);
  }

  onColumnPage(column: BoardColumn, page: number): void {
    this.patchColumn(column.key, { page });
    this.loadColumn(column);
  }

  onCardDropped(event: CdkDragDrop<TaskCardEntity[]>, targetColumn: BoardColumn): void {
    if (event.previousContainer === event.container) {
      return;
    }
    if (!this.canCreate()) {
      toast.error('You cannot move tasks on this board');
      return;
    }

    const card = event.item.data as TaskCardEntity;
    const sourceColumn = this.columns.find((column) => column.statuses.includes(card.status));
    if (!sourceColumn) {
      return;
    }

    const sourceIndex = this.columns.indexOf(sourceColumn);
    const targetIndex = this.columns.indexOf(targetColumn);
    if (targetIndex !== sourceIndex + 1) {
      toast.error('Tasks can only move forward one column at a time');
      return;
    }

    if (card.status === 2 && targetColumn.key === 'done') {
      this.completeUseCase.execute(card.id).subscribe({
        next: () => {
          toast.success('Task completed');
          this.loadColumns();
        },
        error: (err: Error) => toast.error(err.message),
      });
      return;
    }

    if (card.status === 0 || card.status === 1) {
      this.proceedUseCase.execute(card.id).subscribe({
        next: () => {
          toast.success(card.status === 0 ? 'Moved to To Do' : 'Started');
          this.loadColumns();
        },
        error: (err: Error) => toast.error(err.message),
      });
      return;
    }

    toast.error('Use the task drawer to move backward');
  }

  openCard(card: TaskCardEntity): void {
    this.detailsUseCase.execute(card.id).subscribe({
      next: (task) => {
        this.selected.set(task);
        this.showCreate.set(false);
      },
      error: (err: Error) => toast.error(err.message),
    });
  }

  onDrawerChanged(): void {
    const id = this.selected()?.id;
    this.loadColumns();
    if (id) {
      this.detailsUseCase.execute(id).subscribe((task) => this.selected.set(task));
    }
  }

  closeDrawer(): void {
    this.selected.set(null);
  }

  openCreate(): void {
    this.showCreate.set(true);
  }

  onCreated(): void {
    this.showCreate.set(false);
    this.loadColumns();
  }

  goSheet(): void {
    if (this.source !== 'project') {
      return;
    }
    localStorage.setItem('tasks:view', 'sheet');
    void this.router.navigateByUrl(ROUTE_PATHS.taskSheet(this.entityId));
  }

  private loadColumns(): void {
    this.columnsSub?.unsubscribe();
    this.clamping.clear();
    this.columnsSub = forkJoin(
      this.columns.map((column) => this.columnPageUseCase.execute(this.columnParams(column))),
    ).subscribe({
      next: (pages) => {
        this.columns.forEach((column, index) => this.applyColumnPage(column, pages[index]));
      },
      error: (err: Error) => toast.error(err.message),
    });
  }

  private loadColumn(column: BoardColumn): void {
    this.columnPageUseCase.execute(this.columnParams(column)).subscribe({
      next: (page) => this.applyColumnPage(column, page),
      error: (err: Error) => toast.error(err.message),
    });
  }

  private applyColumnPage(column: BoardColumn, page: TaskColumnPageEntity): void {
    if (page.items.length === 0 && page.totalCount > 0 && page.page > 1 && !this.clamping.has(column.key)) {
      const lastPage = Math.max(1, Math.ceil(page.totalCount / this.pageSize));
      this.clamping.add(column.key);
      this.patchColumn(column.key, { page: lastPage });
      this.loadColumn(column);
      return;
    }
    this.clamping.delete(column.key);
    this.patchColumn(column.key, {
      page: page.page,
      totalCount: page.totalCount,
      cards: this.withLoNames(page.items),
    });
  }

  private columnParams(column: BoardColumn) {
    const searchType = this.searchType();
    const learningObjectiveId = searchType === 'lo' ? this.selectedLoId() : 0;
    const name = searchType === 'task' ? this.taskQuery().trim() : '';
    return {
      source: this.source,
      id: this.entityId,
      statuses: column.statuses,
      page: this.pageFor(column),
      pageSize: this.pageSize,
      learningObjectiveId: learningObjectiveId || undefined,
      name: name || undefined,
    };
  }

  private withLoNames(cards: TaskCardEntity[]): TaskCardEntity[] {
    const los = this.board()?.learningObjectives ?? [];
    return cards.map((card) => ({
      ...card,
      learningObjective: los.find((lo) => lo.id === card.learningObjective.id) ?? card.learningObjective,
    }));
  }

  private resetColumnPages(): void {
    this.columnPages.update((state) => {
      const next = { ...state };
      for (const column of this.columns) {
        next[column.key] = { ...next[column.key], page: 1 };
      }
      return next;
    });
  }

  private patchColumn(key: string, patch: Partial<ColumnPageState>): void {
    this.columnPages.update((state) => ({
      ...state,
      [key]: { ...state[key], ...patch },
    }));
  }

  private emptyColumnPages(): Record<string, ColumnPageState> {
    return Object.fromEntries(
      this.columns.map((column) => [column.key, { page: 1, totalCount: 0, cards: [] }]),
    );
  }
}
