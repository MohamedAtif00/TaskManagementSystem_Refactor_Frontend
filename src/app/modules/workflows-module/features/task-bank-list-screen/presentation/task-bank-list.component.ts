import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { toast } from 'ngx-sonner';
import { ButtonComponent } from '@shared/component/button/button.component';
import { PageHeaderComponent } from '@shared/component/page-header/page-header.component';
import {
  TASK_BANK_TYPE_LABELS,
  TaskBankFormPayload,
  TaskBankItem,
  TaskBankTeamOption,
} from '../domain/entity/task-bank-list.entity';
import { ArchiveTaskBankItemUseCase } from '../domain/usecase/archive-task-bank-item.usecase';
import { SaveTaskBankItemUseCase } from '../domain/usecase/save-task-bank-item.usecase';
import { TaskBankListUseCase } from '../domain/usecase/task-bank-list.usecase';
import { TaskBankTeamsUseCase } from '../domain/usecase/task-bank-teams.usecase';

@Component({
  selector: 'app-task-bank-list',
  imports: [FormsModule, PageHeaderComponent, ButtonComponent],
  templateUrl: './task-bank-list.component.html',
})
export class TaskBankListComponent implements OnInit {
  readonly typeLabels = TASK_BANK_TYPE_LABELS;
  readonly types = [
    { id: 0, label: 'Creation' },
    { id: 1, label: 'Review' },
  ];
  readonly rows = signal<TaskBankItem[]>([]);
  readonly teams = signal<TaskBankTeamOption[]>([]);
  readonly showForm = signal(false);
  readonly confirmItem = signal<TaskBankItem | null>(null);
  formError = '';
  form: TaskBankFormPayload = this.emptyForm();

  constructor(
    private listUseCase: TaskBankListUseCase,
    private saveUseCase: SaveTaskBankItemUseCase,
    private archiveUseCase: ArchiveTaskBankItemUseCase,
    private teamsUseCase: TaskBankTeamsUseCase,
  ) {}

  ngOnInit(): void {
    this.load();
    this.teamsUseCase.execute().subscribe((rows) => this.teams.set(rows));
  }

  load(): void {
    this.listUseCase.execute().subscribe({
      next: (rows) => this.rows.set(rows),
      error: (err: Error) => toast.error(err.message),
    });
  }

  typeLabel(type: number): string {
    return this.typeLabels[type] ?? String(type);
  }

  openCreate(): void {
    if (!this.teams().length) {
      toast.error('Create a team before adding task bank items');
      return;
    }
    this.form = this.emptyForm();
    this.formError = '';
    this.showForm.set(true);
  }

  openEdit(row: TaskBankItem, event: Event): void {
    event.stopPropagation();
    this.form = {
      id: row.id,
      name: row.name,
      duration: row.duration,
      type: row.type,
      teamLeaderOnly: row.teamLeaderOnly,
      teamId: row.teamId,
    };
    this.formError = '';
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
  }

  save(): void {
    if (!this.form.name.trim()) {
      this.formError = 'Name is required';
      return;
    }
    if (!this.form.teamId) {
      this.formError = 'Team is required';
      return;
    }
    this.saveUseCase.execute(this.form).subscribe({
      next: () => {
        toast.success(this.form.id != null ? 'Item updated' : 'Item created');
        this.showForm.set(false);
        this.load();
      },
      error: (err: Error) => {
        this.formError = err.message;
        toast.error(err.message);
      },
    });
  }

  askArchive(row: TaskBankItem, event: Event): void {
    event.stopPropagation();
    this.confirmItem.set(row);
  }

  closeConfirm(): void {
    this.confirmItem.set(null);
  }

  confirmArchive(): void {
    const row = this.confirmItem();
    if (!row) {
      return;
    }
    this.archiveUseCase.execute(row.id).subscribe({
      next: () => {
        toast.success('Item deactivated');
        this.confirmItem.set(null);
        this.load();
      },
      error: (err: Error) => toast.error(err.message),
    });
  }

  private emptyForm(): TaskBankFormPayload {
    return {
      name: '',
      duration: 30,
      type: 0,
      teamLeaderOnly: false,
      teamId: this.teams()[0]?.id ?? 0,
    };
  }
}
