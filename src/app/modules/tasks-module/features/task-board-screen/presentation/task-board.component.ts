import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { Component, OnInit, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toast } from 'ngx-sonner';
import { UserRole } from '@core/models/user-role';
import { ROUTE_PATHS } from '@core/navigation/route-paths.const';
import { AuthService } from '@core/services/auth.service';
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
import { GetTaskBoardUseCase } from '../domain/usecase/get-task-board.usecase';
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
export class TaskBoardComponent implements OnInit {
  readonly columns: BoardColumn[] = [
    { label: 'Backlog', key: 'backlog', statuses: [0] },
    { label: 'To Do', key: 'todo', statuses: [1] },
    { label: 'Doing', key: 'doing', statuses: [2] },
    { label: 'Done', key: 'done', statuses: [3, 4] },
  ];
  readonly board = signal<TaskBoardEntity | null>(null);
  readonly selected = signal<TaskDetailsEntity | null>(null);
  readonly showCreate = signal(false);
  readonly searchType = signal<'lo' | 'task'>('lo');
  readonly selectedLoId = signal(0);
  readonly taskQuery = signal('');
  source: BoardSource = 'project';
  entityId = 0;

  readonly filteredCards = computed(() => {
    const cards = this.board()?.cards ?? [];
    const query = this.taskQuery().trim().toLowerCase();
    const selectedLoId = this.selectedLoId();
    const searchType = this.searchType();
    return cards.filter((card) => {
      const matchesLo = !selectedLoId || card.learningObjective.id === selectedLoId;
      const matchesName = searchType !== 'task' || !query || card.name.toLowerCase().includes(query);
      return matchesLo && matchesName;
    });
  });

  readonly backLink = computed(() => (this.source === 'project' ? ROUTE_PATHS.tasks : ROUTE_PATHS.sprints));
  readonly canCreate = computed(
    () => this.source === 'project' && this.auth.user()?.role !== UserRole.Member,
  );

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private auth: AuthService,
    private boardUseCase: GetTaskBoardUseCase,
    private detailsUseCase: GetTaskDetailsUseCase,
    private proceedUseCase: ProceedTaskUseCase,
    private completeUseCase: CompleteTaskUseCase,
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
  }

  load(): void {
    this.boardUseCase.execute({ source: this.source, id: this.entityId }).subscribe({
      next: (board) => this.board.set(board),
      error: (err: Error) => toast.error(err.message),
    });
  }

  cardsFor(column: BoardColumn): TaskCardEntity[] {
    return this.filteredCards().filter((card) => column.statuses.includes(card.status));
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
          this.load();
        },
        error: (err: Error) => toast.error(err.message),
      });
      return;
    }

    if (card.status === 0 || card.status === 1) {
      this.proceedUseCase.execute(card.id).subscribe({
        next: () => {
          toast.success(card.status === 0 ? 'Moved to To Do' : 'Started');
          this.load();
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
    this.load();
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
    this.load();
  }

  goSheet(): void {
    if (this.source !== 'project') {
      return;
    }
    localStorage.setItem('tasks:view', 'sheet');
    void this.router.navigateByUrl(ROUTE_PATHS.taskSheet(this.entityId));
  }
}
