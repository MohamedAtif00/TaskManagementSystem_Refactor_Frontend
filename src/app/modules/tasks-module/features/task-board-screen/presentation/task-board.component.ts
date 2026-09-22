import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { Component, OnDestroy, OnInit, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toast } from 'ngx-sonner';
import { Subscription } from 'rxjs';
import { UserRole } from '@core/models/user-role';
import { ROUTE_PATHS } from '@core/navigation/route-paths.const';
import { CurriculumCatalogService } from '@core/network/curriculum-catalog.service';
import { AuthService } from '@core/services/auth.service';
import { RealtimeService } from '@core/services/realtime.service';
import { TicketStatsService } from '@core/network/ticket-stats.service';
import { ButtonComponent } from '@shared/component/button/button.component';
import { PageHeaderComponent } from '@shared/component/page-header/page-header.component';
import {
  BoardSource,
  TaskBoardEntity,
  TaskCardEntity,
  TaskDetailsEntity,
  TaskStatus,
} from '../domain/entity/task-board.entity';
import { CompleteTaskUseCase } from '../domain/usecase/complete-task.usecase';
import { GetTaskBoardPageUseCase } from '../domain/usecase/get-task-board-page.usecase';
import { GetTaskBoardUseCase } from '../domain/usecase/get-task-board.usecase';
import { GetTaskDetailsUseCase } from '../domain/usecase/get-task-details.usecase';
import { ProceedTaskUseCase } from '../domain/usecase/proceed-task.usecase';
import { KanbanSkeletonComponent } from '@shared/component/skeleton/kanban-skeleton.component';
import { NewTaskModalComponent } from './new-task-modal.component';
import { TaskColumnComponent } from './task-column.component';
import { TaskDrawerComponent } from './task-drawer.component';

interface BoardColumn {
  label: string;
  key: string;
  statuses: TaskStatus[];
}

const BOARD_PAGE_SIZE = 40;

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
    KanbanSkeletonComponent,
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
  readonly boardPageSize = BOARD_PAGE_SIZE;
  readonly loading = signal(true);
  readonly board = signal<TaskBoardEntity | null>(null);
  readonly selected = signal<TaskDetailsEntity | null>(null);
  readonly showCreate = signal(false);
  readonly searchType = signal<'lo' | 'task'>('lo');
  readonly selectedLoId = signal(0);
  readonly taskQuery = signal('');
  readonly boardPage = signal(1);
  readonly boardTotalCount = signal(0);
  readonly cardsByColumn = signal<Record<string, TaskCardEntity[]>>(this.emptyCardsByColumn());
  source: BoardSource = 'project';
  entityId = 0;
  private ticketUpdates?: Subscription;
  private boardPageSub?: Subscription;
  private queryDebounce?: ReturnType<typeof setTimeout>;
  private losLoading = false;

  readonly backLink = computed(() => (this.source === 'project' ? ROUTE_PATHS.tasks : ROUTE_PATHS.sprints));
  readonly canCreate = computed(
    () => this.source === 'project' && this.auth.user()?.role !== UserRole.Member,
  );
  readonly boardTotalPages = computed(() =>
    Math.max(1, Math.ceil(this.boardTotalCount() / this.boardPageSize)),
  );
  readonly showBoardPager = computed(() => this.boardTotalCount() > this.boardPageSize);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private auth: AuthService,
    private boardUseCase: GetTaskBoardUseCase,
    private boardPageUseCase: GetTaskBoardPageUseCase,
    private detailsUseCase: GetTaskDetailsUseCase,
    private proceedUseCase: ProceedTaskUseCase,
    private completeUseCase: CompleteTaskUseCase,
    private realtime: RealtimeService,
    private ticketStats: TicketStatsService,
    private catalog: CurriculumCatalogService,
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
      this.loadBoardPage();
    });
  }

  ngOnDestroy(): void {
    this.ticketUpdates?.unsubscribe();
    this.boardPageSub?.unsubscribe();
    if (this.queryDebounce) {
      clearTimeout(this.queryDebounce);
    }
  }

  load(): void {
    this.loading.set(true);
    this.boardUseCase.execute({ source: this.source, id: this.entityId }).subscribe({
      next: (board) => {
        this.board.set(board);
        this.loadBoardPage();
      },
      error: (err: Error) => {
        this.loading.set(false);
        toast.error(err.message);
      },
    });
  }

  cardsFor(column: BoardColumn): TaskCardEntity[] {
    return this.cardsByColumn()[column.key] ?? [];
  }

  totalFor(column: BoardColumn): number {
    return this.cardsFor(column).length;
  }

  onSearchTypeChange(value: 'lo' | 'task'): void {
    this.searchType.set(value);
    this.boardPage.set(1);
    if (value === 'lo') {
      this.ensureLearningObjectives();
    }
    this.loadBoardPage();
  }

  onLoChange(value: number): void {
    this.selectedLoId.set(value);
    this.boardPage.set(1);
    this.loadBoardPage();
  }

  onTaskQueryChange(value: string): void {
    this.taskQuery.set(value);
    if (this.queryDebounce) {
      clearTimeout(this.queryDebounce);
    }
    this.queryDebounce = setTimeout(() => {
      this.boardPage.set(1);
      this.loadBoardPage();
    }, 300);
  }

  onBoardPage(page: number): void {
    this.boardPage.set(page);
    this.loadBoardPage();
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
          this.loadBoardPage();
        },
        error: (err: Error) => toast.error(err.message),
      });
      return;
    }

    if (card.status === 0 || card.status === 1) {
      this.proceedUseCase.execute(card.id).subscribe({
        next: () => {
          toast.success(card.status === 0 ? 'Moved to To Do' : 'Started');
          this.loadBoardPage();
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
        const board = this.board();
        this.selected.set({
          ...task,
          subjectId: this.source === 'project' ? this.entityId : task.subjectId,
          subjectName: task.subjectName || board?.name || '',
        });
        this.showCreate.set(false);
      },
      error: (err: Error) => toast.error(err.message),
    });
  }

  onDrawerChanged(): void {
    const id = this.selected()?.id;
    this.loadBoardPage();
    if (id) {
      this.detailsUseCase.execute(id).subscribe((task) => {
        const board = this.board();
        this.selected.set({
          ...task,
          subjectId: this.source === 'project' ? this.entityId : task.subjectId,
          subjectName: task.subjectName || board?.name || '',
        });
      });
    }
  }

  closeDrawer(): void {
    this.selected.set(null);
  }

  openCreate(): void {
    this.ensureLearningObjectives();
    this.showCreate.set(true);
  }

  onCreated(): void {
    this.showCreate.set(false);
    this.loadBoardPage();
  }

  goSheet(): void {
    if (this.source !== 'project') {
      return;
    }
    localStorage.setItem('tasks:view', 'sheet');
    void this.router.navigateByUrl(ROUTE_PATHS.taskSheet(this.entityId));
  }

  private loadBoardPage(): void {
    this.boardPageSub?.unsubscribe();
    this.boardPageSub = this.boardPageUseCase.execute(this.boardPageParams()).subscribe({
      next: (page) => {
        if (page.items.length === 0 && page.totalCount > 0 && page.page > 1) {
          const lastPage = Math.max(1, Math.ceil(page.totalCount / this.boardPageSize));
          this.boardPage.set(lastPage);
          this.loadBoardPage();
          return;
        }
        this.boardTotalCount.set(page.totalCount);
        const cards = this.withLoNames(page.items);
        this.cardsByColumn.set(this.splitIntoColumns(cards));
        const loIds = [...new Set(cards.map((card) => card.learningObjective.id))];
        if (loIds.length) {
          this.realtime.joinTicketBoard(loIds);
        }
        this.loading.set(false);
      },
      error: (err: Error) => {
        this.loading.set(false);
        toast.error(err.message);
      },
    });
  }

  private boardPageParams() {
    const searchType = this.searchType();
    const learningObjectiveId = searchType === 'lo' ? this.selectedLoId() : 0;
    const name = searchType === 'task' ? this.taskQuery().trim() : '';
    return {
      source: this.source,
      id: this.entityId,
      page: this.boardPage(),
      pageSize: this.boardPageSize,
      learningObjectiveId: learningObjectiveId || undefined,
      name: name || undefined,
      users: this.board()?.users ?? [],
    };
  }

  private splitIntoColumns(cards: TaskCardEntity[]): Record<string, TaskCardEntity[]> {
    const result = this.emptyCardsByColumn();
    for (const card of cards) {
      const column = this.columns.find((entry) => entry.statuses.includes(card.status));
      if (column) {
        result[column.key].push(card);
      }
    }
    return result;
  }

  private withLoNames(cards: TaskCardEntity[]): TaskCardEntity[] {
    const los = this.board()?.learningObjectives ?? [];
    return cards.map((card) => ({
      ...card,
      learningObjective: los.find((lo) => lo.id === card.learningObjective.id) ?? card.learningObjective,
    }));
  }

  private ensureLearningObjectives(): void {
    const board = this.board();
    if (!board || board.learningObjectives.length > 0 || this.source !== 'project' || this.losLoading) {
      return;
    }
    this.losLoading = true;
    this.catalog.getLosForSubject(this.entityId).subscribe({
      next: (los) => {
        this.board.update((current) =>
          current
            ? {
                ...current,
                learningObjectives: los.map((lo) => ({ id: lo.id, name: lo.name })),
              }
            : current,
        );
        this.cardsByColumn.update((columns) => {
          const next = { ...columns };
          for (const key of Object.keys(next)) {
            next[key] = this.withLoNames(next[key]);
          }
          return next;
        });
        this.losLoading = false;
      },
      error: (err: Error) => {
        this.losLoading = false;
        toast.error(err.message);
      },
    });
  }

  private emptyCardsByColumn(): Record<string, TaskCardEntity[]> {
    return Object.fromEntries(this.columns.map((column) => [column.key, []]));
  }
}
