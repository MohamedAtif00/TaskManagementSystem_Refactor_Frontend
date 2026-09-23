import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { toast } from 'ngx-sonner';
import { ButtonComponent } from '@shared/component/button/button.component';
import {
  JumpPoint,
  TaskActivity,
  TaskComment,
  TaskDetailsEntity,
  TaskIdName,
  TaskPriority,
  TaskWorkTime,
  TASK_PRIORITY_LABELS,
  TASK_STATUS_LABELS,
} from '../domain/entity/task-board.entity';
import { UserRole } from '@core/models/user-role';
import { AuthService } from '@core/services/auth.service';
import { AddCommentUseCase } from '../domain/usecase/add-comment.usecase';
import { DeleteCommentUseCase } from '../domain/usecase/delete-comment.usecase';
import { PauseTaskUseCase } from '../domain/usecase/pause-task.usecase';
import { UpdateCommentUseCase } from '../domain/usecase/update-comment.usecase';
import { AssignTaskUseCase } from '../domain/usecase/assign-task.usecase';
import { ChangePriorityUseCase } from '../domain/usecase/change-priority.usecase';
import { CompleteTaskUseCase } from '../domain/usecase/complete-task.usecase';
import { FlagTaskUseCase } from '../domain/usecase/flag-task.usecase';
import { JumpTaskUseCase } from '../domain/usecase/jump-task.usecase';
import { ListActivityUseCase } from '../domain/usecase/list-activity.usecase';
import { ListJumpPointsUseCase } from '../domain/usecase/list-jump-points.usecase';
import { RollbackTaskUseCase } from '../domain/usecase/rollback-task.usecase';
import { ListCommentsUseCase } from '../domain/usecase/list-comments.usecase';
import { ProceedTaskUseCase } from '../domain/usecase/proceed-task.usecase';
import { SkipTaskUseCase } from '../domain/usecase/skip-task.usecase';
import { StartWorkUseCase } from '../domain/usecase/start-work.usecase';
import { StopWorkUseCase } from '../domain/usecase/stop-work.usecase';

@Component({
  selector: 'app-task-drawer',
  imports: [FormsModule, AngularSvgIconModule, ButtonComponent],
  templateUrl: './task-drawer.component.html',
  styles: [
    `
      .task-actions-toolbar ::ng-deep button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        height: 2rem;
        min-height: 2rem;
        padding-block: 0;
        padding-inline: 0.625rem;
        font-size: 0.75rem;
        line-height: 1rem;
        font-weight: 600;
      }

      .task-actions-toolbar ::ng-deep button span {
        font-size: inherit;
        line-height: inherit;
        font-weight: inherit;
      }

      .task-actions-toolbar ::ng-deep svg-icon svg,
      .task-actions-toolbar ::ng-deep button svg {
        width: 0.875rem;
        height: 0.875rem;
        flex-shrink: 0;
      }
    `,
  ],
})
export class TaskDrawerComponent implements OnChanges {
  @Input({ required: true }) task!: TaskDetailsEntity;
  @Input() users: TaskIdName[] = [];
  @Output() closed = new EventEmitter<void>();
  @Output() changed = new EventEmitter<void>();

  readonly statusLabels = TASK_STATUS_LABELS;
  readonly priorityLabels = TASK_PRIORITY_LABELS;
  readonly priorityOptions = [
    { value: 0 as TaskPriority, label: 'None' },
    { value: 1 as TaskPriority, label: 'Low' },
    { value: 2 as TaskPriority, label: 'Medium' },
    { value: 3 as TaskPriority, label: 'High' },
  ];
  readonly actionLabelClass = 'inline-flex items-center gap-1.5 whitespace-nowrap text-xs font-semibold leading-4';
  readonly actionIconClass = 'size-3.5 shrink-0';

  assignUserId = '';
  priorityChoice: TaskPriority = 0;
  jumpStepId = 0;
  confirmComplete = false;
  showAssignPanel = false;
  showPriorityPanel = false;
  showJumpPanel = false;
  comments: TaskComment[] = [];
  activities: TaskActivity[] = [];
  jumpPoints: JumpPoint[] = [];
  draft = '';
  editingCommentId: number | null = null;
  editingDraft = '';
  commentsBusy = false;
  activityBusy = false;
  jumpPointsBusy = false;
  timerBusy = false;
  timerRunning = false;
  lastWork: TaskWorkTime | null = null;

  constructor(
    private cdr: ChangeDetectorRef,
    private proceedUseCase: ProceedTaskUseCase,
    private completeUseCase: CompleteTaskUseCase,
    private assignUseCase: AssignTaskUseCase,
    private flagUseCase: FlagTaskUseCase,
    private rollbackUseCase: RollbackTaskUseCase,
    private skipUseCase: SkipTaskUseCase,
    private jumpUseCase: JumpTaskUseCase,
    private changePriorityUseCase: ChangePriorityUseCase,
    private listJumpPointsUseCase: ListJumpPointsUseCase,
    private listActivityUseCase: ListActivityUseCase,
    private listCommentsUseCase: ListCommentsUseCase,
    private addCommentUseCase: AddCommentUseCase,
    private updateCommentUseCase: UpdateCommentUseCase,
    private deleteCommentUseCase: DeleteCommentUseCase,
    private pauseUseCase: PauseTaskUseCase,
    private auth: AuthService,
    private startWorkUseCase: StartWorkUseCase,
    private stopWorkUseCase: StopWorkUseCase,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['task'] && this.task) {
      const previous = changes['task'].previousValue as TaskDetailsEntity | undefined;
      if (previous?.id !== this.task.id) {
        this.resetPanels();
        this.priorityChoice = this.task.priority;
        this.loadComments();
        this.loadActivity();
      } else {
        this.priorityChoice = this.task.priority;
        this.loadActivity();
      }
    }
  }

  get showActions(): boolean {
    return this.task.access !== 'None';
  }

  get canWork(): boolean {
    return this.task.access === 'WorkOn' || this.task.access === 'WorkOnAndManage';
  }

  get canManage(): boolean {
    return this.task.access === 'Manage' || this.task.access === 'WorkOnAndManage';
  }

  get workBlocked(): boolean {
    return this.task.paused || this.task.flagged;
  }

  get canStart(): boolean {
    return this.canWork && !this.workBlocked && (this.task.status === 0 || this.task.status === 1);
  }

  get canComplete(): boolean {
    return this.canWork && !this.workBlocked && this.task.status === 2;
  }

  get canAssign(): boolean {
    return this.canManage;
  }

  get canChangePriority(): boolean {
    return this.canManage;
  }

  get canSkipOrJump(): boolean {
    const role = this.auth.user()?.role;
    return this.showActions && (role === UserRole.ProjectManager || role === UserRole.Owner);
  }

  get canFlag(): boolean {
    return this.showActions && this.task.status !== 0;
  }

  get canPause(): boolean {
    return this.showActions && !this.task.flagged && !this.task.paused && this.task.status === 2;
  }

  get canResume(): boolean {
    return this.showActions && this.task.paused && this.task.user?.id === this.auth.user()?.id;
  }

  get canRollback(): boolean {
    return this.canWork && !this.workBlocked && !!this.task.isReview && this.task.status === 2;
  }

  get canTime(): boolean {
    return this.canWork && !this.workBlocked && this.task.status === 2;
  }

  get assignableUsers(): TaskIdName[] {
    const role = this.auth.user()?.role;
    if (role === UserRole.ProjectManager || role === UserRole.Owner || this.task.teamId == null) {
      return this.users;
    }
    const knowsTeams = this.users.some((user) => user.teamId != null);
    if (!knowsTeams) {
      return this.users;
    }
    return this.users.filter((user) => user.teamId === this.task.teamId);
  }

  startLabel(): string {
    return this.task.status === 0 ? 'Add' : 'Start';
  }

  statusBadgeClass(): string {
    const base = 'inline-flex rounded-full border-2 px-4 py-1 text-sm font-semibold shadow-sm';
    switch (this.task.status) {
      case 1:
        return `${base} border-blue-300 bg-blue-500 text-white`;
      case 2:
        return `${base} border-amber-300 bg-amber-500 text-white`;
      case 3:
        return `${base} border-emerald-300 bg-emerald-500 text-white`;
      case 4:
        return `${base} border-red-300 bg-red-500 text-white`;
      default:
        return `${base} border-foreground/40 bg-background text-foreground`;
    }
  }

  priorityClass(): string {
    switch (this.task.priority) {
      case 3:
        return 'text-rose-500';
      case 2:
        return 'text-orange-400';
      case 1:
        return 'text-blue-400';
      default:
        return 'text-foreground';
    }
  }

  formatStamp(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }
    const day = date.getDate();
    const month = date.toLocaleString('en-GB', { month: 'short' });
    const hours = date.getHours();
    const minutes = `${date.getMinutes()}`.padStart(2, '0');
    const suffix = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    return `${day} ${month} ${date.getFullYear()} · ${hour12}:${minutes} ${suffix}`;
  }

  formatDuration(minutes: number): string {
    if (!minutes) {
      return '0 min';
    }
    if (minutes < 1) {
      return `${Math.max(1, Math.round(minutes * 60))}s`;
    }
    return `${minutes.toFixed(1)} min`;
  }

  askComplete(): void {
    this.confirmComplete = true;
  }

  proceed(): void {
    this.proceedUseCase.execute(this.task.id).subscribe({
      next: () => {
        toast.success(this.task.status === 0 ? 'Moved to To Do' : 'Started');
        this.loadActivity();
        this.changed.emit();
      },
      error: (err: Error) => toast.error(err.message),
    });
  }

  complete(): void {
    this.completeUseCase.execute(this.task.id).subscribe({
      next: () => {
        this.confirmComplete = false;
        toast.success('Completed');
        this.loadActivity();
        this.changed.emit();
      },
      error: (err: Error) => toast.error(err.message),
    });
  }

  assign(): void {
    const userId = Number(this.assignUserId);
    if (!userId) {
      toast.error('Pick a person');
      return;
    }
    this.assignUseCase.execute({ taskId: this.task.id, userId }).subscribe({
      next: () => {
        toast.success('Assigned');
        this.showAssignPanel = false;
        this.loadActivity();
        this.changed.emit();
      },
      error: (err: Error) => toast.error(err.message),
    });
  }

  flag(): void {
    this.flagUseCase.execute(this.task.id).subscribe({
      next: () => {
        toast.success(this.task.flagged ? 'Flag cleared' : 'Flagged');
        this.loadActivity();
        this.changed.emit();
      },
      error: (err: Error) => toast.error(err.message),
    });
  }

  pause(): void {
    this.pauseUseCase.execute(this.task.id).subscribe({
      next: () => {
        toast.success(this.task.paused ? 'Resumed' : 'Paused');
        this.loadActivity();
        this.changed.emit();
      },
      error: (err: Error) => toast.error(err.message),
    });
  }

  rollback(): void {
    this.rollbackUseCase.execute(this.task.id).subscribe({
      next: () => {
        toast.success('Rolled back');
        this.loadActivity();
        this.changed.emit();
      },
      error: (err: Error) => toast.error(err.message),
    });
  }

  skip(): void {
    this.skipUseCase.execute(this.task.id).subscribe({
      next: () => {
        toast.success('Skipped');
        this.loadActivity();
        this.changed.emit();
      },
      error: (err: Error) => toast.error(err.message),
    });
  }

  openJumpPanel(): void {
    const opening = !this.showJumpPanel;
    this.showJumpPanel = opening;
    if (!opening) {
      return;
    }
    this.loadJumpPoints();
  }

  private loadJumpPoints(force = false): void {
    if (this.jumpPointsBusy || (!force && this.jumpPoints.length)) {
      return;
    }
    this.jumpPointsBusy = true;
    this.listJumpPointsUseCase.execute(this.task.id).subscribe({
      next: (points) => {
        this.jumpPoints = points;
        this.jumpStepId = points[0]?.stepId ?? 0;
        this.jumpPointsBusy = false;
        this.cdr.markForCheck();
      },
      error: (err: Error) => {
        this.jumpPointsBusy = false;
        this.cdr.markForCheck();
        toast.error(err.message);
      },
    });
  }

  jump(): void {
    if (!this.jumpStepId) {
      toast.error('Pick a step');
      return;
    }
    this.jumpUseCase.execute({ taskId: this.task.id, stepId: this.jumpStepId }).subscribe({
      next: () => {
        toast.success('Jumped');
        this.showJumpPanel = false;
        this.loadActivity();
        this.changed.emit();
      },
      error: (err: Error) => toast.error(err.message),
    });
  }

  changePriority(): void {
    this.changePriorityUseCase.execute({ taskId: this.task.id, priority: this.priorityChoice }).subscribe({
      next: () => {
        toast.success('Priority updated');
        this.showPriorityPanel = false;
        this.loadActivity();
        this.changed.emit();
      },
      error: (err: Error) => toast.error(err.message),
    });
  }

  loadComments(): void {
    this.commentsBusy = true;
    this.listCommentsUseCase.execute(this.task.id).subscribe({
      next: (rows) => {
        this.comments = rows;
        this.commentsBusy = false;
        this.cdr.markForCheck();
      },
      error: (err: Error) => {
        this.commentsBusy = false;
        this.cdr.markForCheck();
        toast.error(err.message);
      },
    });
  }

  loadActivity(): void {
    this.activityBusy = true;
    this.listActivityUseCase.execute(this.task.id).subscribe({
      next: (rows) => {
        this.activities = rows;
        this.activityBusy = false;
        this.cdr.markForCheck();
      },
      error: (err: Error) => {
        this.activityBusy = false;
        this.cdr.markForCheck();
        toast.error(err.message);
      },
    });
  }

  postComment(): void {
    const content = this.draft.trim();
    if (!content) {
      toast.error('Write a comment');
      return;
    }
    this.addCommentUseCase.execute({ ticketId: this.task.id, content }).subscribe({
      next: () => {
        this.draft = '';
        toast.success('Comment added');
        this.loadComments();
        this.loadActivity();
      },
      error: (err: Error) => toast.error(err.message),
    });
  }

  canEditComment(comment: TaskComment): boolean {
    return comment.userId === this.auth.user()?.id;
  }

  canDeleteComment(comment: TaskComment): boolean {
    const user = this.auth.user();
    if (!user) {
      return false;
    }
    return comment.userId === user.id || user.role === UserRole.ProjectManager || user.role === UserRole.Owner;
  }

  startEditComment(comment: TaskComment): void {
    this.editingCommentId = comment.id;
    this.editingDraft = comment.content;
  }

  cancelEditComment(): void {
    this.editingCommentId = null;
    this.editingDraft = '';
  }

  saveComment(comment: TaskComment): void {
    const content = this.editingDraft.trim();
    if (!content) {
      toast.error('Write a comment');
      return;
    }
    this.updateCommentUseCase.execute({ ticketId: this.task.id, commentId: comment.id, content }).subscribe({
      next: () => {
        this.cancelEditComment();
        toast.success('Comment updated');
        this.loadComments();
        this.loadActivity();
      },
      error: (err: Error) => toast.error(err.message),
    });
  }

  removeComment(comment: TaskComment): void {
    this.deleteCommentUseCase.execute({ ticketId: this.task.id, commentId: comment.id }).subscribe({
      next: () => {
        toast.success('Comment deleted');
        this.loadComments();
        this.loadActivity();
      },
      error: (err: Error) => toast.error(err.message),
    });
  }

  startTimer(): void {
    this.timerBusy = true;
    this.startWorkUseCase.execute(this.task.id).subscribe({
      next: (work) => {
        this.timerBusy = false;
        this.timerRunning = true;
        this.lastWork = work;
        this.cdr.markForCheck();
        toast.success('Timer started');
      },
      error: (err: Error) => {
        this.timerBusy = false;
        if (/already (exists|open)/i.test(err.message) || /work_time_already_open/i.test(err.message)) {
          this.timerRunning = true;
          this.cdr.markForCheck();
          toast.info('Timer already running');
          return;
        }
        this.cdr.markForCheck();
        toast.error(err.message);
      },
    });
  }

  stopTimer(): void {
    this.timerBusy = true;
    this.stopWorkUseCase.execute(this.task.id).subscribe({
      next: (work) => {
        this.timerBusy = false;
        this.timerRunning = false;
        this.lastWork = work;
        this.cdr.markForCheck();
        toast.success(`Stopped · ${this.formatDuration(work.duration)}`);
      },
      error: (err: Error) => {
        this.timerBusy = false;
        if (/not found/i.test(err.message)) {
          this.timerRunning = false;
        }
        this.cdr.markForCheck();
        toast.error(err.message);
      },
    });
  }

  private resetPanels(): void {
    this.draft = '';
    this.editingCommentId = null;
    this.editingDraft = '';
    this.assignUserId = '';
    this.jumpStepId = 0;
    this.showAssignPanel = false;
    this.showPriorityPanel = false;
    this.showJumpPanel = false;
    this.timerRunning = false;
    this.lastWork = null;
    this.jumpPoints = [];
    this.comments = [];
    this.activities = [];
    this.commentsBusy = false;
    this.activityBusy = false;
  }
}
