import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { LoCodeDisplayService } from '@core/lo-code/lo-code-display.service';
import { LoCodeLabelPipe } from '@shared/pipes/lo-code-label.pipe';
import { TaskCardEntity, TASK_PRIORITY_LABELS } from '../domain/entity/task-board.entity';

@Component({
  selector: 'app-task-card',
  imports: [LoCodeLabelPipe],
  templateUrl: './task-card.component.html',
})
export class TaskCardComponent {
  @Input({ required: true }) card!: TaskCardEntity;
  @Output() open = new EventEmitter<TaskCardEntity>();

  readonly loDisplay = inject(LoCodeDisplayService);
  readonly priorityLabels = TASK_PRIORITY_LABELS;
}
