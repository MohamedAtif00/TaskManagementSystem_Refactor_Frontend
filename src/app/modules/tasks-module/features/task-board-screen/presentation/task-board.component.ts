import { CdkDragDrop, CdkDragEnd } from '@angular/cdk/drag-drop';
import { Component, HostListener, OnDestroy, OnInit, computed, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { toast } from 'ngx-sonner';
import { forkJoin, Observable, of, Subscription } from 'rxjs';
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
  TaskIdName,
  TaskPriority,
  TaskStatus,
} from '../domain/entity/task-board.entity';
import { learningObjectivesForAssignment, pruneLearningObjectiveIds } from '../domain/board-assignment-scope';
import { CompleteTaskUseCase } from '../domain/usecase/complete-task.usecase';
import { GetTaskBoardUseCase } from '../domain/usecase/get-task-board.usecase';
import { GetTaskColumnPageUseCase } from '../domain/usecase/get-task-column-page.usecase';
import { GetTaskDetailsUseCase } from '../domain/usecase/get-task-details.usecase';
import { PauseTaskUseCase } from '../domain/usecase/pause-task.usecase';
import { ProceedTaskUseCase } from '../domain/usecase/proceed-task.usecase';
import { AssignTaskUseCase } from '../domain/usecase/assign-task.usecase';
import { ChangePriorityUseCase } from '../domain/usecase/change-priority.usecase';
import { JumpTaskUseCase } from '../domain/usecase/jump-task.usecase';
import { SkipTaskUseCase } from '../domain/usecase/skip-task.usecase';
import { TaskCardMenuComponent } from './task-card-menu.component';
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
    PageHeaderComponent,
    LoCodeDisplayToggleComponent,
    ButtonComponent,
    TaskBoardFiltersComponent,
    TaskColumnComponent,
    TaskDrawerComponent,
    NewTaskModalComponent,
    TaskCardMenuComponent,
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
  readonly draggingFrom = signal<string | null>(null);
  readonly learningObjectivesLoading = signal(false);
  readonly subjects = signal<{ id: number; name: string }[]>([]);
  readonly subjectMenuOpen = signal(false);
  readonly cardMenu = signal<{ card: TaskCardEntity; x: number; y: number } | null>(null);
  readonly subjectOptions = computed(() => {
    const items = this.subjects();
    const current = this.board();
    if (!current || items.some((item) => item.id === this.entityId)) {
      return items;
    }
    return [{ id: this.entityId, name: current.name }, ...items];
  });
  source: BoardSource = 'project';
  entityId = 0;
  private ticketUpdates?: Subscription;
  private routeSub?: Subscription;
  private boardSub?: Subscription;
  private subjectNamesSub?: Subscription;
  private boardPageSub?: Subscription;
  private refreshDebounce?: ReturnType<typeof setTimeout>;
  private fullLosLoading = false;
  private fullLosLoaded = false;
  private routeReady = false;
  private readonly moves = new Map<number, InflightMove>();
  private readonly moveSubs = new Map<number, Subscription>();
  private menuActionSub?: Subscription;

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
    private assignUseCase: AssignTaskUseCase,
    private changePriorityUseCase: ChangePriorityUseCase,
    private skipUseCase: SkipTaskUseCase,
    private jumpUseCase: JumpTaskUseCase,
    private completeUseCase: CompleteTaskUseCase,
    private pauseUseCase: PauseTaskUseCase,
    private realtime: RealtimeService,
    private analytics: AnalyticsOverviewService,
  private ticketSummary: TicketSummaryService,
    private catalog: CurriculumCatalogService,
  ) {}

  ngOnInit(): void {
    this.routeSub = this.route.paramMap.subscribe((params) => {
      const projectId = params.get('projectId');
      const sprintId = params.get('sprintId');
      const source: BoardSource = projectId ? 'project' : 'sprint';
      const id = Number(projectId ?? sprintId);
      if (this.routeReady && source === this.source && id === this.entityId) {
        return;
      }
      const changed = this.routeReady;
      this.routeReady = true;
      this.source = source;
      this.entityId = id;
      if (source === 'project') {
        localStorage.setItem('tasks:view', 'board');
        this.loadSubjectNames();
      }
      if (changed) {
        this.selected.set(null);
        this.showCreate.set(false);
        this.subjectMenuOpen.set(false);
        this.cardMenu.set(null);
        this.fullLosLoaded = false;
        this.fullLosLoading = false;
      }
      this.load();
    });
    this.ticketUpdates = this.realtime.onTicketUpdated().subscribe(() => {
      this.scheduleBoardRefresh();
    });
  }

  ngOnDestroy(): void {
    this.ticketUpdates?.unsubscribe();
    this.routeSub?.unsubscribe();
    this.boardSub?.unsubscribe();
    this.subjectNamesSub?.unsubscribe();
    this.boardPageSub?.unsubscribe();
    for (const sub of this.moveSubs.values()) {
      sub.unsubscribe();
    }
    this.menuActionSub?.unsubscribe();
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

  @HostListener('document:click')
  closeSubjectMenu(): void {
    this.subjectMenuOpen.set(false);
  }

  toggleSubjectMenu(event: Event): void {
    event.stopPropagation();
    this.subjectMenuOpen.update((open) => !open);
  }

  pickSubject(id: number): void {
    this.subjectMenuOpen.set(false);
    if (!id || id === this.entityId) {
      return;
    }
    void this.router.navigateByUrl(ROUTE_PATHS.taskBoard(id));
  }

  load(): void {
    this.boardSub?.unsubscribe();
    this.boardPageSub?.unsubscribe();
    this.loading.set(true);
    this.board.set(null);
    const source = this.source;
    const id = this.entityId;
    this.boardSub = this.boardUseCase.execute({ source, id }).subscribe({
      next: (board) => {
        if (this.source !== source || this.entityId !== id) {
          return;
        }
        this.board.set(board);
        this.loadBoardPage();
      },
      error: (err: Error) => {
        if (this.source !== source || this.entityId !== id) {
          return;
        }
        this.loading.set(false);
        toast.error(err.message);
      },
    });
  }

  private loadSubjectNames(): void {
    if (this.subjectNamesSub) {
      return;
    }
    this.subjectNamesSub = this.catalog.listSubjectNames().subscribe({
      next: (subjects) => this.subjects.set(subjects),
      error: (err: Error) => toast.error(err.message),
    });
  }

  cardsFor(column: BoardColumn): TaskCardEntity[] {
    return this.cardsByColumn()[column.key] ?? [];
  }

  connectedColumns(columnKey: string): string[] {
    return this.columns.map((column) => column.key).filter((key) => key !== columnKey);
  }

  acceptsFrom(columnKey: string): string[] {
    return this.columns.map((column) => column.key).filter((sourceKey) => this.canMove(sourceKey, columnKey));
  }

  isDropForbidden(columnKey: string): boolean {
    const sourceKey = this.draggingFrom();
    return !!sourceKey && sourceKey !== columnKey && !this.canMove(sourceKey, columnKey);
  }

  onColumnDragStart(columnKey: string): void {
    this.draggingFrom.set(columnKey);
  }

  onColumnDragEnd(event: CdkDragEnd<TaskCardEntity>, sourceKey: string): void {
    const targetKey = this.columnKeyAtPoint(event.dropPoint.x, event.dropPoint.y);
    this.draggingFrom.set(null);
    if (targetKey && targetKey !== sourceKey && !this.canMove(sourceKey, targetKey)) {
      toast.error('That column move is not allowed');
    }
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
    this.startColumnMove(event.item.data as TaskCardEntity, event.previousContainer.id, targetColumn.key);
  }

  openCardMenu(request: { card: TaskCardEntity; x: number; y: number }): void {
    if (this.movingIds().has(request.card.id)) {
      return;
    }
    this.subjectMenuOpen.set(false);
    this.cardMenu.set(request);
  }

  onMenuAdd(card: TaskCardEntity): void {
    this.cardMenu.set(null);
    this.startColumnMove(card, 'backlog', 'todo');
  }

  onMenuAssign(card: TaskCardEntity, userId: number): void {
    this.cardMenu.set(null);
    this.runMenuAction(this.assignUseCase.execute({ taskId: card.id, userId }), 'Assigned');
  }

  onMenuPriority(card: TaskCardEntity, priority: TaskPriority): void {
    this.cardMenu.set(null);
    if (priority === card.priority) {
      return;
    }
    this.runMenuAction(this.changePriorityUseCase.execute({ taskId: card.id, priority }), 'Priority updated');
  }

  onMenuSkip(card: TaskCardEntity): void {
    this.cardMenu.set(null);
    this.runMenuAction(this.skipUseCase.execute(card.id), 'Skipped');
  }

  onMenuJump(card: TaskCardEntity, stepId: number): void {
    this.cardMenu.set(null);
    this.runMenuAction(this.jumpUseCase.execute({ taskId: card.id, stepIds: [stepId] }), 'Jumped');
  }

  onMenuOpen(card: TaskCardEntity): void {
    this.cardMenu.set(null);
    this.openCard(card);
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

  loadFullLearningObjectives(): void {
    const board = this.board();
    if (!board || this.source !== 'project' || this.fullLosLoaded || this.fullLosLoading) {
      return;
    }
    this.fullLosLoading = true;
    this.learningObjectivesLoading.set(true);
    this.catalog.getLosForSubject(this.entityId).subscribe({
      next: (los) => {
        const active = los.map((lo) => ({ id: lo.id, name: lo.name }));
        this.fullLosLoaded = true;
        this.replaceLearningObjectives(active);
        const selected = this.filters().learningObjectiveIds;
        const pruned = pruneLearningObjectiveIds(selected, active);
        if (pruned.length !== selected.length) {
          this.filters.update((current) => ({ ...current, learningObjectiveIds: pruned }));
          this.boardPage.set(1);
          this.loadBoardPage();
        }
        this.fullLosLoading = false;
        this.learningObjectivesLoading.set(false);
      },
      error: (err: Error) => {
        this.fullLosLoading = false;
        this.learningObjectivesLoading.set(false);
        toast.error(err.message);
      },
    });
  }

  openCreate(): void {
    this.loadFullLearningObjectives();
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
    const source = this.source;
    const id = this.entityId;
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
        if (this.source !== source || this.entityId !== id) {
          return;
        }
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

        const pageObjectives = this.columns.flatMap((column) =>
          cardsByColumn[column.key].map((card) => card.learningObjective),
        );
        const loIds = [...new Set(pageObjectives.map((objective) => objective.id))];
        if (loIds.length) {
          this.realtime.joinTicketBoard(loIds);
        }
        this.mergeLearningObjectives(pageObjectives);
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
    return cards.map((card) => {
      const stored = los.find((lo) => lo.id === card.learningObjective.id);
      const learningObjective = stored && !this.isPlaceholderLo(stored) ? stored : card.learningObjective;
      return { ...card, learningObjective };
    });
  }

  private isPlaceholderLo(lo: TaskIdName): boolean {
    return lo.name === `LO ${lo.id}`;
  }

  private replaceLearningObjectives(incoming: TaskIdName[]): void {
    this.board.update((current) => (current ? { ...current, learningObjectives: incoming } : current));
    this.refreshCardLearningObjectiveNames();
  }

  private mergeLearningObjectives(incoming: TaskIdName[]): void {
    if (!incoming.length) {
      return;
    }
    this.board.update((current) => {
      if (!current) {
        return current;
      }
      const byId = new Map(current.learningObjectives.map((lo) => [lo.id, lo]));
      for (const lo of incoming) {
        const existing = byId.get(lo.id);
        if (this.fullLosLoaded && !existing) {
          continue;
        }
        if (existing && !this.isPlaceholderLo(existing) && this.isPlaceholderLo(lo)) {
          continue;
        }
        byId.set(lo.id, lo);
      }
      return { ...current, learningObjectives: [...byId.values()] };
    });
    this.refreshCardLearningObjectiveNames();
  }

  private refreshCardLearningObjectiveNames(): void {
    this.cardsByColumn.update((columns) => {
      const next = { ...columns };
      for (const key of Object.keys(next)) {
        next[key] = this.withLoNames(next[key]);
      }
      return next;
    });
  }

  private emptyCardsByColumn(): Record<string, TaskCardEntity[]> {
    return Object.fromEntries(this.columns.map((column) => [column.key, []]));
  }

  private emptyColumnTotals(): Record<string, number> {
    return Object.fromEntries(this.columns.map((column) => [column.key, 0]));
  }

  private canMove(sourceKey: string, targetKey: string): boolean {
    return (
      (sourceKey === 'backlog' && targetKey === 'todo') ||
      (sourceKey === 'todo' && targetKey === 'doing') ||
      (sourceKey === 'doing' && targetKey === 'done') ||
      (sourceKey === 'doing' && targetKey === 'todo')
    );
  }

  private columnKeyAtPoint(x: number, y: number): string | null {
    for (const column of this.columns) {
      const element = document.getElementById(column.key);
      if (!element) {
        continue;
      }
      const rect = element.getBoundingClientRect();
      if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
        return column.key;
      }
    }
    return null;
  }

  private startColumnMove(card: TaskCardEntity, sourceKey: string, targetKey: string): void {
    const existing = this.moves.get(card.id);
    if (existing && (existing.queuedKey ?? existing.targetKey) === targetKey) {
      return;
    }

    const stepSource = existing ? (existing.queuedKey ?? existing.targetKey) : sourceKey;
    const step = this.legalMove(stepSource, targetKey, existing?.card ?? card);
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

  private runMenuAction(request: Observable<unknown>, message: string): void {
    this.menuActionSub?.unsubscribe();
    this.menuActionSub = request.subscribe({
      next: () => {
        toast.success(message);
        this.loadBoardPage();
      },
      error: (err: Error) => toast.error(err.message),
    });
  }

  private legalMove(
    sourceKey: string,
    targetKey: string,
    card: TaskCardEntity,
  ): { action: MoveAction; message: string; patch: Partial<TaskCardEntity> } | null {
    if (!this.canMove(sourceKey, targetKey)) {
      return null;
    }
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
