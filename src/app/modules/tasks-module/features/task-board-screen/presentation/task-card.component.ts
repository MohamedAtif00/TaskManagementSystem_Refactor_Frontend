import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TaskCardEntity, TASK_PRIORITY_LABELS } from '../domain/entity/task-board.entity';

@Component({
  selector: 'app-task-card',
  templateUrl: './task-card.component.html',
})
export class TaskCardComponent {
  @Input({ required: true }) card!: TaskCardEntity;
  @Output() open = new EventEmitter<TaskCardEntity>();

  readonly priorityLabels = TASK_PRIORITY_LABELS;
}
