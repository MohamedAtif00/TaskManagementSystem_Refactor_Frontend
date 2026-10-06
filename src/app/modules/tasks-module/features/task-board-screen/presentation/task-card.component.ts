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
  @Input() moving = false;
  @Input() contextMenu = false;
  @Input() menuActive = false;
  @Output() open = new EventEmitter<TaskCardEntity>();
  @Output() cardContextMenu = new EventEmitter<{ card: TaskCardEntity; x: number; y: number }>();

  readonly loDisplay = inject(LoCodeDisplayService);
  readonly priorityLabels = TASK_PRIORITY_LABELS;

  onOpen(): void {
    if (this.moving) {
      return;
    }
    this.open.emit(this.card);
  }

  onContextMenu(event: MouseEvent): void {
    if (!this.contextMenu || this.moving) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    this.cardContextMenu.emit({ card: this.card, x: event.clientX, y: event.clientY });
  }
}
