import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Component, OnDestroy, OnInit, computed, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toast } from 'ngx-sonner';
import { forkJoin, of, Subscription } from 'rxjs';
import { PermissionCodes } from '@core/models/permission-codes';
import { ROUTE_PATHS } from '@core/navigation/route-paths.const';
import { CurriculumCatalogService } from '@core/network/curriculum-catalog.service';
import { AuthService } from '@core/services/auth.service';
import { RealtimeService } from '@core/services/realtime.service';
import { AnalyticsOverviewService } from '@core/network/analytics-overview.service';
import { TicketSummaryService } from '@core/network/ticket-summary.service';
import { ButtonComponent } from '@shared/component/button/button.component';
import { LoCodeDisplayToggleComponent } from '@shared/component/lo-code-display-toggle/lo-code-display-toggle.component';
import { PageHeaderComponent } from '@shared/component/page-header/page-header.component';
import {
  BoardSource,
  emptyTaskBoardFilters,
  TaskBoardEntity,
  TaskBoardFilters,
  TaskCardEntity,
  TaskColumnPageParams,
  TaskDetailsEntity,
  TaskStatus,
} from '../domain/entity/task-board.entity';
import { learningObjectivesForAssignment, pruneLearningObjectiveIds } from '../domain/board-assignment-scope';
import { CompleteTaskUseCase } from '../domain/usecase/complete-task.usecase';
import { GetTaskBoardUseCase } from '../domain/usecase/get-task-board.usecase';
import { GetTaskColumnPageUseCase } from '../domain/usecase/get-task-column-page.usecase';
import { GetTaskDetailsUseCase } from '../domain/usecase/get-task-details.usecase';
import { PauseTaskUseCase } from '../domain/usecase/pause-task.usecase';
import { ProceedTaskUseCase } from '../domain/usecase/proceed-task.usecase';
import { KanbanSkeletonComponent } from '@shared/component/skeleton/kanban-skeleton.component';
import { TaskBoardFiltersComponent } from './task-board-filters.component';
import { NewTaskModalComponent } from './new-task-modal.component';
import { TaskColumnComponent } from './task-column.component';
import { TaskDrawerComponent } from './task-drawer.component';

interface BoardColumn {
  label: string;
  key: string;
  statuses: TaskStatus[];
}

type MoveAction = 'proceed' | 'pause' | 'complete';

interface InflightMove {
  sourceKey: string;
  targetKey: string;
  queuedKey: string | null;
  originCard: TaskCardEntity;
  card: TaskCardEntity;
  message: string;
}

const COLUMN_PAGE_SIZE = 10;

@Component({
  selector: 'app-task-board',
  imports: [
    RouterLink,
    PageHeaderComponent,
    LoCodeDisplayToggleComponent,
    ButtonComponent,
    TaskBoardFiltersComponent,
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
  readonly columnPageSize = COLUMN_PAGE_SIZE;
  readonly loading = signal(true);
  readonly board = signal<TaskBoardEntity | null>(null);
  readonly selected = signal<TaskDetailsEntity | null>(null);
  readonly showCreate = signal(false);
  readonly filters = signal<TaskBoardFilters>(emptyTaskBoardFilters());
  readonly boardPage = signal(1);
  readonly columnTotalCounts = signal<Record<string, number>>(this.emptyColumnTotals());
  readonly cardsByColumn = signal<Record<string, TaskCardEntity[]>>(this.emptyCardsByColumn());
  readonly movingIds = signal<ReadonlySet<number>>(new Set());
  source: BoardSource = 'project';
  entityId = 0;
  private ticketUpdates?: Subscription;
  private boardPageSub?: Subscription;
  private refreshDebounce?: ReturnType<typeof setTimeout>;
  private losLoading = false;
  private readonly moves = new Map<number, InflightMove>();
  private readonly moveSubs = new Map<number, Subscription>();

  readonly backLink = computed(() => (this.source === 'project' ? ROUTE_PATHS.tasks : ROUTE_PATHS.sprints));
  readonly canCreate = computed(
    () => this.source === 'project' && this.auth.hasPermission(PermissionCodes.Tickets.Create),
  );
  readonly boardTotalPages = computed(() => {
    const totals = Object.values(this.columnTotalCounts());
    if (!totals.length) {
      return 1;
    }
    return Math.max(1, ...totals.map((count) => Math.ceil(count / this.columnPageSize)));
  });
  readonly showBoardPager = computed(() =>
    Object.values(this.columnTotalCounts()).some((count) => count > this.columnPageSize),
  );
  readonly taskCount = computed(() =>
    Object.values(this.columnTotalCounts()).reduce((sum, count) => sum + count, 0),
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
    private pauseUseCase: PauseTaskUseCase,
    private realtime: RealtimeService,
    private analytics: AnalyticsOverviewService,
  private ticketSummary: TicketSummaryService,
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
      this.scheduleBoardRefresh();
    });
  }

  ngOnDestroy(): void {
    this.ticketUpdates?.unsubscribe();
    this.boardPageSub?.unsubscribe();
    for (const sub of this.moveSubs.values()) {
      sub.unsubscribe();
    }
    if (this.refreshDebounce) {
      clearTimeout(this.refreshDebounce);
    }
  }

  private scheduleBoardRefresh(): void {
    if (this.refreshDebounce) {
      clearTimeout(this.refreshDebounce);
    }
    this.refreshDebounce = setTimeout(() => {
      this.analytics.invalidate();
      if (this.source === 'project') {
        this.ticketSummary.invalidateSubject(this.entityId);
      } else {
        this.ticketSummary.invalidateSprint(this.entityId);
      }
      this.loadBoardPage();
    }, 300);
  }

  load(): void {
    this.loading.set(true);
    this.boardUseCase.execute({ source: this.source, id: this.entityId }).subscribe({
      next: (board) => {
        this.board.set(board);
        this.ensureLearningObjectives();
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

  connectedColumns(columnKey: string): string[] {
    return this.columns.map((column) => column.key).filter((key) => key !== columnKey);
  }

  totalFor(column: BoardColumn): number {
    return this.columnTotalCounts()[column.key] ?? this.cardsFor(column).length;
  }

  currentUserId(): number | null {
    return this.auth.user()?.id ?? null;
  }

  scopedObjectives() {
    return this.objectivesFor(this.filters());
  }

  onFiltersChange(filters: TaskBoardFilters): void {
    const visible = this.objectivesFor(filters);
    this.filters.set({
      ...filters,
      learningObjectiveIds: pruneLearningObjectiveIds(filters.learningObjectiveIds, visible),
    });
    this.boardPage.set(1);
    this.loadBoardPage();
  }

  onBoardPage(page: number): void {
    this.boardPage.set(page);
    this.loadBoardPage();
  }

  onCardDropped(event: CdkDragDrop<TaskCardEntity[]>, targetColumn: BoardColumn): void {
    if (event.previousContainer === event.container) {
      return;
    }

    const card = event.item.data as TaskCardEntity;
    const sourceKey = event.previousContainer.id;
    const targetKey = targetColumn.key;
    const existing = this.moves.get(card.id);
    if (existing && (existing.queuedKey ?? existing.targetKey) === targetKey) {
      return;
    }

    const stepSource = existing ? (existing.queuedKey ?? existing.targetKey) : sourceKey;
    const step = this.legalMove(existing ? stepSource : sourceKey, targetKey, existing?.card ?? card);
    if (!step) {
      toast.error('That column move is not allowed');
      return;
    }

    const nextCard = { ...(existing?.card ?? card), ...step.patch };
    this.placeCard(nextCard, targetKey);
    if (existing) {
      existing.queuedKey = targetKey;
      existing.card = nextCard;
      this.moves.set(card.id, existing);
      this.markMoving(card.id, true);
      return;
    }

    this.moves.set(card.id, {
      sourceKey,
      targetKey,
      queuedKey: null,
      originCard: card,
      card: nextCard,
      message: step.message,
    });
    this.markMoving(card.id, true);
    this.sendMove(card.id, step.action);
  }

  openCard(card: TaskCardEntity): void {
    if (this.movingIds().has(card.id)) {
      return;
    }
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
    if (this.source === 'project') {
      localStorage.setItem('tasks:view', 'sheet');
      void this.router.navigateByUrl(ROUTE_PATHS.taskSheet(this.entityId));
      return;
    }
    void this.router.navigateByUrl(ROUTE_PATHS.sprintSheet(this.entityId));
  }

  private loadBoardPage(): void {
    this.boardPageSub?.unsubscribe();
    const requests = this.columns.map((column) => {
      const params = this.columnPageParams(column);
      if (!params.statuses.length) {
        return of({
          items: [] as TaskCardEntity[],
          page: this.boardPage(),
          pageSize: this.columnPageSize,
          totalCount: 0,
        });
      }
      return this.columnPageUseCase.execute(params);
    });
    this.boardPageSub = forkJoin(requests).subscribe({
      next: (pages) => {
        const totals = this.emptyColumnTotals();
        const cardsByColumn = this.emptyCardsByColumn();
        let hasAnyCards = false;
        let maxTotal = 0;

        this.columns.forEach((column, index) => {
          const page = pages[index];
          totals[column.key] = page.totalCount;
          cardsByColumn[column.key] = this.withLoNames(page.items);
          if (page.items.length) {
            hasAnyCards = true;
          }
          maxTotal = Math.max(maxTotal, page.totalCount);
        });

        this.retainMovingCards(cardsByColumn, totals);
        hasAnyCards = this.columns.some((column) => cardsByColumn[column.key].length > 0);

        const currentPage = this.boardPage();
        const lastPage = Math.max(1, Math.ceil(maxTotal / this.columnPageSize));
        if (!hasAnyCards && maxTotal > 0 && currentPage > 1) {
          this.boardPage.set(lastPage);
          this.loadBoardPage();
          return;
        }

        this.columnTotalCounts.set(totals);
        this.cardsByColumn.set(cardsByColumn);

        const loIds = [
          ...new Set(
            this.columns.flatMap((column) => cardsByColumn[column.key].map((card) => card.learningObjective.id)),
          ),
        ];
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

  private columnPageParams(column: BoardColumn): TaskColumnPageParams {
    const filters = this.filters();
    const statuses = filters.statuses.length
      ? column.statuses.filter((status) => filters.statuses.includes(status))
      : column.statuses;
    const assigneeIds = this.assigneeIdsFor(filters);
    return {
      source: this.source,
      id: this.entityId,
      statuses,
      page: this.boardPage(),
      pageSize: this.columnPageSize,
      filters,
      assigneeIds,
      users: this.board()?.users ?? [],
    };
  }

  private assigneeIdsFor(filters: TaskBoardFilters): number[] {
    const me = this.auth.user()?.id;
    const assigneeIds = new Set(filters.userIds);
    if (filters.assignedToMe && me) {
      assigneeIds.add(me);
    }
    return [...assigneeIds];
  }

  private objectivesFor(filters: TaskBoardFilters) {
    return learningObjectivesForAssignment(
      this.board()?.learningObjectives ?? [],
      this.board()?.assignmentLinks ?? null,
      this.assigneeIdsFor(filters),
      filters.unassigned,
    );
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

  private emptyColumnTotals(): Record<string, number> {
    return Object.fromEntries(this.columns.map((column) => [column.key, 0]));
  }

  private legalMove(
    sourceKey: string,
    targetKey: string,
    card: TaskCardEntity,
  ): { action: MoveAction; message: string; patch: Partial<TaskCardEntity> } | null {
    if (sourceKey === 'backlog' && targetKey === 'todo') {
      return { action: 'proceed', message: 'Moved to To Do', patch: { status: 1 } };
    }
    if (sourceKey === 'todo' && targetKey === 'doing') {
      return { action: 'proceed', message: card.paused ? 'Resumed' : 'Started', patch: { status: 2, paused: false } };
    }
    if (sourceKey === 'doing' && targetKey === 'done') {
      return { action: 'complete', message: 'Task completed', patch: { status: 3 } };
    }
    if (sourceKey === 'doing' && targetKey === 'todo') {
      return { action: 'pause', message: 'Moved to To Do', patch: { status: 1, paused: true } };
    }
    return null;
  }

  private sendMove(cardId: number, action: MoveAction): void {
    const request =
      action === 'complete'
        ? this.completeUseCase.execute(cardId)
        : action === 'pause'
          ? this.pauseUseCase.execute(cardId)
          : this.proceedUseCase.execute(cardId);
    this.moveSubs.set(
      cardId,
      request.subscribe({
        next: (updated) => this.onMoveSucceeded(cardId, updated),
        error: (err: Error) => this.onMoveFailed(cardId, err),
      }),
    );
  }

  private onMoveSucceeded(cardId: number, updated: TaskCardEntity): void {
    const move = this.moves.get(cardId);
    if (!move) {
      return;
    }
    toast.success(move.message);
    const arrived = move.targetKey;
    const queued = move.queuedKey;
    const patch = this.legalMove(move.sourceKey, arrived, move.originCard)?.patch;
    const arrivedCard: TaskCardEntity = {
      ...move.originCard,
      ...updated,
      learningObjective: move.originCard.learningObjective,
      ...(patch ?? {}),
    };
    if (!queued || queued === arrived) {
      this.finishMove(cardId);
      return;
    }
    const step = this.legalMove(arrived, queued, arrivedCard);
    if (!step) {
      toast.error('That column move is not allowed');
      this.placeCard(arrivedCard, arrived);
      this.finishMove(cardId);
      return;
    }
    const nextCard = { ...arrivedCard, ...step.patch };
    this.moves.set(cardId, {
      sourceKey: arrived,
      targetKey: queued,
      queuedKey: null,
      originCard: arrivedCard,
      card: nextCard,
      message: step.message,
    });
    this.placeCard(nextCard, queued);
    this.sendMove(cardId, step.action);
  }

  private onMoveFailed(cardId: number, err: Error): void {
    const move = this.moves.get(cardId);
    if (move) {
      this.placeCard(move.originCard, move.sourceKey);
    }
    this.finishMove(cardId);
    toast.error(err.message);
  }

  private finishMove(cardId: number): void {
    this.moves.delete(cardId);
    this.moveSubs.delete(cardId);
    this.markMoving(cardId, false);
    this.loadBoardPage();
  }

  private placeCard(card: TaskCardEntity, columnKey: string): void {
    const columns = { ...this.cardsByColumn() };
    let fromKey: string | null = null;
    for (const column of this.columns) {
      const items = columns[column.key] ?? [];
      if (items.some((item) => item.id === card.id)) {
        fromKey = column.key;
        columns[column.key] = items.filter((item) => item.id !== card.id);
      }
    }
    columns[columnKey] = [card, ...(columns[columnKey] ?? []).filter((item) => item.id !== card.id)];
    this.cardsByColumn.set(columns);
    if (fromKey && fromKey !== columnKey) {
      this.columnTotalCounts.update((totals) => ({
        ...totals,
        [fromKey]: Math.max(0, (totals[fromKey] ?? 0) - 1),
        [columnKey]: (totals[columnKey] ?? 0) + 1,
      }));
    }
  }

  private retainMovingCards(cardsByColumn: Record<string, TaskCardEntity[]>, totals: Record<string, number>): void {
    for (const move of this.moves.values()) {
      const destination = move.queuedKey ?? move.targetKey;
      for (const column of this.columns) {
        const next = cardsByColumn[column.key].filter((card) => card.id !== move.card.id);
        if (next.length !== cardsByColumn[column.key].length) {
          totals[column.key] = Math.max(0, (totals[column.key] ?? 0) - 1);
          cardsByColumn[column.key] = next;
        }
      }
      const [named] = this.withLoNames([move.card]);
      cardsByColumn[destination] = [named, ...cardsByColumn[destination].filter((card) => card.id !== named.id)];
      totals[destination] = (totals[destination] ?? 0) + 1;
    }
  }

  private markMoving(cardId: number, moving: boolean): void {
    const next = new Set(this.movingIds());
    if (moving) {
      next.add(cardId);
    } else {
      next.delete(cardId);
    }
    this.movingIds.set(next);
  }
}
