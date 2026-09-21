import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { toast } from 'ngx-sonner';
import { ButtonComponent } from '@shared/component/button/button.component';
import {
  TaskComment,
  TaskDetailsEntity,
  TaskIdName,
  TaskWorkTime,
  TASK_PRIORITY_LABELS,
  TASK_STATUS_LABELS,
} from '../domain/entity/task-board.entity';
import { AddCommentUseCase } from '../domain/usecase/add-comment.usecase';
import { AssignTaskUseCase } from '../domain/usecase/assign-task.usecase';
import { CompleteTaskUseCase } from '../domain/usecase/complete-task.usecase';
import { FlagTaskUseCase } from '../domain/usecase/flag-task.usecase';
import { RollbackTaskUseCase } from '../domain/usecase/rollback-task.usecase';
import { ListCommentsUseCase } from '../domain/usecase/list-comments.usecase';
import { ProceedTaskUseCase } from '../domain/usecase/proceed-task.usecase';
import { StartWorkUseCase } from '../domain/usecase/start-work.usecase';
import { StopWorkUseCase } from '../domain/usecase/stop-work.usecase';

@Component({
  selector: 'app-task-drawer',
  imports: [FormsModule, ButtonComponent],
  templateUrl: './task-drawer.component.html',
})
export class TaskDrawerComponent implements OnChanges {
  @Input({ required: true }) task!: TaskDetailsEntity;
  @Input() users: TaskIdName[] = [];
  @Output() closed = new EventEmitter<void>();
  @Output() changed = new EventEmitter<void>();

  readonly statusLabels = TASK_STATUS_LABELS;
  readonly priorityLabels = TASK_PRIORITY_LABELS;
  assignUserId = '';
  confirmComplete = false;
  comments: TaskComment[] = [];
  draft = '';
  commentsBusy = false;
  timerBusy = false;
  timerRunning = false;
  lastWork: TaskWorkTime | null = null;

  constructor(
    private proceedUseCase: ProceedTaskUseCase,
    private completeUseCase: CompleteTaskUseCase,
    private assignUseCase: AssignTaskUseCase,
    private flagUseCase: FlagTaskUseCase,
    private rollbackUseCase: RollbackTaskUseCase,
    private listCommentsUseCase: ListCommentsUseCase,
    private addCommentUseCase: AddCommentUseCase,
    private startWorkUseCase: StartWorkUseCase,
    private stopWorkUseCase: StopWorkUseCase,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['task'] && this.task) {
      const previous = changes['task'].previousValue as TaskDetailsEntity | undefined;
      if (previous?.id !== this.task.id) {
        this.draft = '';
        this.timerRunning = false;
        this.lastWork = null;
        this.loadComments();
      }
    }
  }

  get canWork(): boolean {
    return this.task.access === 'WorkOn' || this.task.access === 'WorkOnAndManage';
  }

  get canManage(): boolean {
    return this.task.access === 'Manage' || this.task.access === 'WorkOnAndManage';
  }

  get canStart(): boolean {
    return this.canWork && (this.task.status === 0 || this.task.status === 1);
  }

  get canComplete(): boolean {
    return this.canWork && this.task.status === 2;
  }

  get canTime(): boolean {
    return this.canWork || this.canManage;
  }

  startLabel(): string {
    return this.task.status === 0 ? 'Add' : 'Start';
  }

  statusBadgeClass(): string {
    const base = 'rounded-full border-2 px-4 py-1 text-sm font-semibold shadow-sm';
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
        this.changed.emit();
      },
      error: (err: Error) => toast.error(err.message),
    });
  }

  flag(): void {
    this.flagUseCase.execute(this.task.id).subscribe({
      next: () => {
        toast.success(this.task.flagged ? 'Flag cleared' : 'Flagged');
        this.changed.emit();
      },
      error: (err: Error) => toast.error(err.message),
    });
  }

  rollback(): void {
    this.rollbackUseCase.execute(this.task.id).subscribe({
      next: () => {
        toast.success('Rolled back');
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
      },
      error: (err: Error) => {
        this.commentsBusy = false;
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
        toast.success('Timer started');
      },
      error: (err: Error) => {
        this.timerBusy = false;
        if (/already (exists|open)/i.test(err.message) || /work_time_already_open/i.test(err.message)) {
          this.timerRunning = true;
          toast.info('Timer already running');
          return;
        }
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
        toast.success(`Stopped · ${this.formatDuration(work.duration)}`);
      },
      error: (err: Error) => {
        this.timerBusy = false;
        if (/not found/i.test(err.message)) {
          this.timerRunning = false;
        }
        toast.error(err.message);
      },
    });
  }
}
