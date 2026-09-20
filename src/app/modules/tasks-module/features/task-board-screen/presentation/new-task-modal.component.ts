import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { toast } from 'ngx-sonner';
import { environment } from '@environments/environment';
import { ButtonComponent } from '@shared/component/button/button.component';
import { CreateTaskPayload, TaskIdName } from '../domain/entity/task-board.entity';
import { CreateTaskUseCase } from '../domain/usecase/create-task.usecase';
import { ListTaskBankUseCase } from '../domain/usecase/list-task-bank.usecase';

@Component({
  selector: 'app-new-task-modal',
  imports: [FormsModule, ButtonComponent],
  templateUrl: './new-task-modal.component.html',
})
export class NewTaskModalComponent implements OnInit {
  @Input({ required: true }) subjectId = 0;
  @Input() learningObjectives: TaskIdName[] = [];
  @Input() users: TaskIdName[] = [];
  @Output() closed = new EventEmitter<void>();
  @Output() created = new EventEmitter<void>();

  readonly useMock = environment.useMock;
  name = '';
  learningObjectiveId = 0;
  userId = 0;
  taskBankItemId = 0;
  taskBank: { id: number; name: string }[] = [];
  error = '';

  constructor(
    private createUseCase: CreateTaskUseCase,
    private taskBankUseCase: ListTaskBankUseCase,
  ) {}

  ngOnInit(): void {
    this.taskBankUseCase.execute().subscribe({
      next: (rows) => (this.taskBank = rows),
      error: (err: Error) => toast.error(err.message),
    });
  }

  save(): void {
    this.error = '';
    if (!this.learningObjectiveId) {
      this.error = 'Learning objective is required';
      return;
    }
    if (this.useMock && !this.name.trim()) {
      this.error = 'Name and learning objective are required';
      return;
    }
    if (!this.useMock && !this.taskBankItemId) {
      this.error = 'Task bank item is required';
      return;
    }
    const payload: CreateTaskPayload = {
      subjectId: this.subjectId,
      name: this.name.trim() || 'Task',
      learningObjectiveId: this.learningObjectiveId,
      userId: this.userId || undefined,
      taskBankItemId: this.taskBankItemId || undefined,
    };
    this.createUseCase.execute(payload).subscribe({
      next: () => {
        toast.success('Task created');
        this.created.emit();
      },
      error: (err: Error) => toast.error(err.message),
    });
  }
}
