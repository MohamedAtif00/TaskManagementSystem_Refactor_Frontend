import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LoCodeDisplayService } from '@core/lo-code/lo-code-display.service';
import { LoCodeLabelPipe } from '@shared/pipes/lo-code-label.pipe';
import { ClickOutsideDirective } from '@shared/directives/click-outside.directive';
import {
  SavedBoardView,
  TASK_PRIORITY_LABELS,
  TASK_STATUS_LABELS,
  TaskBoardFilters,
  TaskIdName,
  TaskPriority,
  TaskStatus,
  taskBoardFiltersActive,
} from '../domain/entity/task-board.entity';

interface FilterChip {
  key: string;
  label: string;
}

type ShortcutId = 'all' | 'mine' | 'unassigned' | 'high' | 'flagged' | 'paused';

const STATUS_OPTIONS: TaskStatus[] = [0, 1, 2, 3, 4];
const PRIORITY_OPTIONS: TaskPriority[] = [3, 2, 1, 0];
const HIGH_PRIORITY: TaskPriority = 3;

@Component({
  selector: 'app-task-board-filters',
  imports: [FormsModule, LoCodeLabelPipe, ClickOutsideDirective],
  templateUrl: './task-board-filters.component.html',
})
export class TaskBoardFiltersComponent implements OnChanges, OnDestroy {
  readonly loDisplay = inject(LoCodeDisplayService);
  readonly statusOptions = STATUS_OPTIONS;
  readonly priorityOptions = PRIORITY_OPTIONS;
  readonly statusLabels = TASK_STATUS_LABELS;
  readonly priorityLabels = TASK_PRIORITY_LABELS;

  @Input({ required: true }) filters!: TaskBoardFilters;
  @Input() users: TaskIdName[] = [];
  @Input() learningObjectives: TaskIdName[] = [];
  @Input() userId: number | null = null;
  @Input() taskCount = 0;
  @Output() filtersChange = new EventEmitter<TaskBoardFilters>();

  query = '';
  panelOpen = false;
  assignmentOpen = false;
  viewName = '';
  savedViews: SavedBoardView[] = [];
  private queryPending = false;
  private queryTimer?: ReturnType<typeof setTimeout>;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['filters'] && !this.queryPending) {
      this.query = this.filters.query;
    }
    if (changes['userId']) {
      this.savedViews = this.readViews();
    }
  }

  ngOnDestroy(): void {
    if (this.queryTimer) {
      clearTimeout(this.queryTimer);
    }
  }

  shortcutActive(id: ShortcutId): boolean {
    if (id === 'all') {
      return !taskBoardFiltersActive(this.filters);
    }
    if (id === 'mine') {
      return this.filters.assignedToMe;
    }
    if (id === 'unassigned') {
      return this.filters.unassigned;
    }
    if (id === 'high') {
      return this.filters.priorities.includes(HIGH_PRIORITY);
    }
    if (id === 'flagged') {
      return this.filters.flagged;
    }
    return this.filters.paused;
  }

  onShortcut(id: ShortcutId): void {
    if (id === 'all') {
      this.emit(this.cleared());
      return;
    }
    if (id === 'mine') {
      this.emit({ ...this.filters, assignedToMe: !this.filters.assignedToMe });
      return;
    }
    if (id === 'unassigned') {
      this.emit({ ...this.filters, unassigned: !this.filters.unassigned });
      return;
    }
    if (id === 'high') {
      this.emit({ ...this.filters, priorities: this.toggleValue(this.filters.priorities, HIGH_PRIORITY) });
      return;
    }
    if (id === 'flagged') {
      this.emit({ ...this.filters, flagged: !this.filters.flagged });
      return;
    }
    this.emit({ ...this.filters, paused: !this.filters.paused });
  }

  onQuery(value: string): void {
    this.query = value;
    this.queryPending = true;
    if (this.queryTimer) {
      clearTimeout(this.queryTimer);
    }
    this.queryTimer = setTimeout(() => {
      this.queryPending = false;
      this.emit({ ...this.filters, query: value });
    }, 300);
  }

  toggleStatus(status: TaskStatus): void {
    this.emit({ ...this.filters, statuses: this.toggleValue(this.filters.statuses, status) });
  }

  togglePriority(priority: TaskPriority): void {
    this.emit({ ...this.filters, priorities: this.toggleValue(this.filters.priorities, priority) });
  }

  toggleUser(userId: number): void {
    this.emit({ ...this.filters, userIds: this.toggleValue(this.filters.userIds, userId) });
  }

  toggleObjective(id: number): void {
    this.emit({
      ...this.filters,
      learningObjectiveIds: this.toggleValue(this.filters.learningObjectiveIds, id),
    });
  }

  assignmentLabel(): string {
    const parts: string[] = [];
    if (this.filters.assignedToMe) {
      parts.push('Assigned to me');
    }
    if (this.filters.unassigned) {
      parts.push('Unassigned');
    }
    for (const userId of this.filters.userIds) {
      parts.push(this.users.find((user) => user.id === userId)?.name ?? `User ${userId}`);
    }
    return parts.length ? parts.join(', ') : 'Anyone';
  }

  toggleAssignedToMe(): void {
    this.emit({ ...this.filters, assignedToMe: !this.filters.assignedToMe });
  }

  toggleUnassigned(): void {
    this.emit({ ...this.filters, unassigned: !this.filters.unassigned });
  }

  toggleFlagged(): void {
    this.emit({ ...this.filters, flagged: !this.filters.flagged });
  }

  togglePaused(): void {
    this.emit({ ...this.filters, paused: !this.filters.paused });
  }

  toggleRolledBack(): void {
    this.emit({ ...this.filters, rolledBack: !this.filters.rolledBack });
  }

  chips(): FilterChip[] {
    const filters = this.filters;
    const chips: FilterChip[] = [];
    const query = filters.query.trim();
    if (query) {
      chips.push({ key: 'query', label: `Search: ${query}` });
    }
    if (filters.assignedToMe) {
      chips.push({ key: 'mine', label: 'Assigned to me' });
    }
    for (const userId of filters.userIds) {
      const user = this.users.find((row) => row.id === userId);
      chips.push({ key: `user:${userId}`, label: user?.name ?? `User ${userId}` });
    }
    if (filters.unassigned) {
      chips.push({ key: 'unassigned', label: 'Unassigned' });
    }
    for (const status of filters.statuses) {
      chips.push({ key: `status:${status}`, label: this.statusLabels[status] });
    }
    for (const priority of filters.priorities) {
      chips.push({ key: `priority:${priority}`, label: `${this.priorityLabels[priority]} priority` });
    }
    for (const id of filters.learningObjectiveIds) {
      const objective = this.learningObjectives.find((row) => row.id === id);
      chips.push({ key: `lo:${id}`, label: objective?.name ?? `Objective ${id}` });
    }
    if (filters.flagged) {
      chips.push({ key: 'flagged', label: 'Flagged' });
    }
    if (filters.paused) {
      chips.push({ key: 'paused', label: 'Paused' });
    }
    if (filters.rolledBack) {
      chips.push({ key: 'rolledBack', label: 'Rolled back' });
    }
    return chips;
  }

  removeChip(chip: FilterChip): void {
    const filters = this.filters;
    if (chip.key === 'query') {
      this.queryPending = false;
      this.query = '';
      this.emit({ ...filters, query: '' });
      return;
    }
    if (chip.key === 'mine') {
      this.emit({ ...filters, assignedToMe: false });
      return;
    }
    if (chip.key === 'unassigned') {
      this.emit({ ...filters, unassigned: false });
      return;
    }
    if (chip.key === 'flagged') {
      this.emit({ ...filters, flagged: false });
      return;
    }
    if (chip.key === 'paused') {
      this.emit({ ...filters, paused: false });
      return;
    }
    if (chip.key === 'rolledBack') {
      this.emit({ ...filters, rolledBack: false });
      return;
    }
    const [kind, rawId] = chip.key.split(':');
    const id = Number(rawId);
    if (kind === 'user') {
      this.emit({ ...filters, userIds: filters.userIds.filter((userId) => userId !== id) });
      return;
    }
    if (kind === 'status') {
      this.emit({ ...filters, statuses: filters.statuses.filter((status) => status !== id) });
      return;
    }
    if (kind === 'priority') {
      this.emit({ ...filters, priorities: filters.priorities.filter((priority) => priority !== id) });
      return;
    }
    if (kind === 'lo') {
      this.emit({
        ...filters,
        learningObjectiveIds: filters.learningObjectiveIds.filter((objectiveId) => objectiveId !== id),
      });
    }
  }

  clearAll(): void {
    this.emit(this.cleared());
  }

  canSaveView(): boolean {
    return this.viewName.trim().length > 0 && taskBoardFiltersActive(this.filters);
  }

  saveView(): void {
    const name = this.viewName.trim();
    if (!name || !taskBoardFiltersActive(this.filters)) {
      return;
    }
    const next: SavedBoardView[] = [
      ...this.savedViews,
      { id: crypto.randomUUID(), name, filters: { ...this.filters, userIds: [...this.filters.userIds], statuses: [...this.filters.statuses], priorities: [...this.filters.priorities], learningObjectiveIds: [...this.filters.learningObjectiveIds] } },
    ];
    this.persist(next);
    this.viewName = '';
  }

  applyView(view: SavedBoardView): void {
    this.queryPending = false;
    this.query = view.filters.query;
    this.filtersChange.emit({
      ...view.filters,
      userIds: [...view.filters.userIds],
      statuses: [...view.filters.statuses],
      priorities: [...view.filters.priorities],
      learningObjectiveIds: [...view.filters.learningObjectiveIds],
    });
  }

  deleteView(id: string): void {
    this.persist(this.savedViews.filter((view) => view.id !== id));
  }

  private emit(filters: TaskBoardFilters): void {
    this.filtersChange.emit(filters);
  }

  private cleared(): TaskBoardFilters {
    this.queryPending = false;
    this.query = '';
    return {
      query: '',
      assignedToMe: false,
      userIds: [],
      unassigned: false,
      statuses: [],
      priorities: [],
      learningObjectiveIds: [],
      flagged: false,
      paused: false,
      rolledBack: false,
    };
  }

  private toggleValue<T>(values: T[], value: T): T[] {
    return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
  }

  private readViews(): SavedBoardView[] {
    const raw = localStorage.getItem(this.storageKey());
    if (!raw) {
      return [];
    }
    try {
      const parsed = JSON.parse(raw) as SavedBoardView[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private persist(views: SavedBoardView[]): void {
    this.savedViews = views;
    localStorage.setItem(this.storageKey(), JSON.stringify(views));
  }

  private storageKey(): string {
    return `tms-board-views:${this.userId ?? 'anonymous'}`;
  }
}
