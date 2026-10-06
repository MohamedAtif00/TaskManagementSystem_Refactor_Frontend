import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, EventEmitter, HostListener, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, inject } from '@angular/core';
import { toast } from 'ngx-sonner';
import { PermissionCodes } from '@core/models/permission-codes';
import { UserRole } from '@core/models/user-role';
import { AuthService } from '@core/services/auth.service';
import { taskAccessFor } from '../domain/task-access';
import {
  JumpPoint,
  TaskCardEntity,
  TaskIdName,
  TaskPriority,
  TASK_PRIORITY_LABELS,
} from '../domain/entity/task-board.entity';
import { ListJumpPointsUseCase } from '../domain/usecase/list-jump-points.usecase';

type Submenu = 'assign' | 'priority' | 'jump';

@Component({
  selector: 'app-task-card-menu',
  templateUrl: './task-card-menu.component.html',
  host: {
    class: 'fixed z-50',
    '[style.left.px]': 'left',
    '[style.top.px]': 'top',
    '(click)': '$event.stopPropagation()',
    '(wheel)': '$event.stopPropagation()',
    '(contextmenu)': '$event.preventDefault()',
  },
})
export class TaskCardMenuComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly auth = inject(AuthService);
  private readonly listJumpPoints = inject(ListJumpPointsUseCase);
  private readonly cdr = inject(ChangeDetectorRef);
  private scrollListener = (event: Event): void => {
    const target = event.target;
    if (target instanceof Node && this.host.nativeElement.contains(target)) {
      return;
    }
    this.closed.emit();
  };
  private contextMenuListener = (event: Event): void => {
    const target = event.target;
    if (target instanceof Node && this.host.nativeElement.contains(target)) {
      return;
    }
    this.suppressOutsideClose = true;
    queueMicrotask(() => {
      this.suppressOutsideClose = false;
    });
  };

  @Input({ required: true }) card!: TaskCardEntity;
  @Input() users: TaskIdName[] = [];
  @Input() x = 0;
  @Input() y = 0;
  @Output() add = new EventEmitter<void>();
  @Output() assign = new EventEmitter<number>();
  @Output() priority = new EventEmitter<TaskPriority>();
  @Output() skip = new EventEmitter<void>();
  @Output() jump = new EventEmitter<number>();
  @Output() open = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  readonly priorityOptions: { value: TaskPriority; label: string }[] = [
    { value: 0, label: TASK_PRIORITY_LABELS[0] },
    { value: 1, label: TASK_PRIORITY_LABELS[1] },
    { value: 2, label: TASK_PRIORITY_LABELS[2] },
    { value: 3, label: TASK_PRIORITY_LABELS[3] },
  ];

  left = 0;
  top = 0;
  submenu: Submenu | null = null;
  submenuOnLeft = false;
  jumpPoints: JumpPoint[] = [];
  jumpPointsBusy = false;
  private jumpPointsLoaded = false;
  private pointerDownInside = false;
  private suppressOutsideClose = false;
  private destroyed = false;

  constructor() {
    document.addEventListener('scroll', this.scrollListener, true);
    document.addEventListener('contextmenu', this.contextMenuListener, true);
  }

  ngOnInit(): void {
    this.left = this.x;
    this.top = this.y;
  }

  ngOnChanges(changes: SimpleChanges): void {
    const cardChanged = !!changes['card'] && !changes['card'].firstChange;
    const moved = (!!changes['x'] && !changes['x'].firstChange) || (!!changes['y'] && !changes['y'].firstChange);
    if (!cardChanged && !moved) {
      return;
    }
    if (cardChanged) {
      this.submenu = null;
      this.jumpPoints = [];
      this.jumpPointsBusy = false;
      this.jumpPointsLoaded = false;
    }
    this.left = this.x;
    this.top = this.y;
    requestAnimationFrame(() => this.place(this.x, this.y));
  }

  ngAfterViewInit(): void {
    this.place(this.x, this.y);
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    document.removeEventListener('scroll', this.scrollListener, true);
    document.removeEventListener('contextmenu', this.contextMenuListener, true);
  }

  get canAdd(): boolean {
    return this.canWork && !this.card.paused && !this.card.flagged;
  }

  get canManage(): boolean {
    const access = this.access;
    return access === 'Manage' || access === 'WorkOnAndManage';
  }

  get canSkip(): boolean {
    return this.access !== 'None' && this.auth.hasPermission(PermissionCodes.Tickets.Manage);
  }

  get canJump(): boolean {
    return this.canSkip && this.auth.hasRole([UserRole.Owner, UserRole.ProjectManager]);
  }

  get assignLabel(): string {
    return this.card.user ? 'Re-assign' : 'Assign';
  }

  get assignableUsers(): TaskIdName[] {
    if (this.auth.hasPermission(PermissionCodes.Tickets.Manage) || this.card.teamId == null) {
      return this.users;
    }
    const knowsTeams = this.users.some((user) => user.teamId != null);
    if (!knowsTeams) {
      return this.users;
    }
    return this.users.filter((user) => user.teamId === this.card.teamId);
  }

  @HostListener('document:mousedown', ['$event'])
  onDocumentMouseDown(event: MouseEvent): void {
    this.pointerDownInside = event.target instanceof Node && this.host.nativeElement.contains(event.target);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.suppressOutsideClose) {
      this.suppressOutsideClose = false;
      return;
    }
    if (event.button !== 0 || this.pointerDownInside || (event.target instanceof Node && this.host.nativeElement.contains(event.target))) {
      return;
    }
    this.closed.emit();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closed.emit();
  }

  toggleSubmenu(name: Submenu): void {
    this.submenu = this.submenu === name ? null : name;
    if (this.submenu === 'jump') {
      this.loadJumpPoints();
    }
    queueMicrotask(() => this.place(this.left, this.top));
  }

  private get access() {
    return taskAccessFor(this.auth.user(), this.card);
  }

  private get canWork(): boolean {
    const access = this.access;
    return access === 'WorkOn' || access === 'WorkOnAndManage';
  }

  private loadJumpPoints(): void {
    if (this.jumpPointsBusy || this.jumpPointsLoaded) {
      return;
    }
    this.jumpPointsBusy = true;
    this.listJumpPoints.execute(this.card.id).subscribe({
      next: (points) => {
        if (this.destroyed) {
          return;
        }
        this.jumpPoints = points;
        this.jumpPointsBusy = false;
        this.jumpPointsLoaded = true;
        this.cdr.markForCheck();
        queueMicrotask(() => {
          if (this.destroyed) {
            return;
          }
          this.place(this.left, this.top);
          this.cdr.markForCheck();
        });
      },
      error: (err: Error) => {
        if (this.destroyed) {
          return;
        }
        this.jumpPointsBusy = false;
        this.cdr.markForCheck();
        toast.error(err.message);
      },
    });
  }

  private place(x: number, y: number): void {
    const rect = this.host.nativeElement.getBoundingClientRect();
    const width = rect.width || 220;
    const height = rect.height || 240;
    this.submenuOnLeft = x + width + 200 > window.innerWidth;
    let left = x;
    let top = y;
    if (left + width > window.innerWidth - 8) {
      left = Math.max(8, window.innerWidth - width - 8);
    }
    if (top + height > window.innerHeight - 8) {
      top = Math.max(8, window.innerHeight - height - 8);
    }
    this.left = left;
    this.top = top;
  }
}
