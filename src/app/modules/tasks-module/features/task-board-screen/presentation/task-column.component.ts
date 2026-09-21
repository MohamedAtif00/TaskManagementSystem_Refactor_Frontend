import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TaskCardEntity } from '../domain/entity/task-board.entity';
import { TaskCardComponent } from './task-card.component';

@Component({
  selector: 'app-task-column',
  imports: [DragDropModule, TaskCardComponent],
  templateUrl: './task-column.component.html',
})
export class TaskColumnComponent {
  @Input({ required: true }) label = '';
  @Input({ required: true }) columnKey = '';
  @Input() cards: TaskCardEntity[] = [];
  @Output() openCard = new EventEmitter<TaskCardEntity>();
  @Output() dropped = new EventEmitter<CdkDragDrop<TaskCardEntity[]>>();

  sorted(): TaskCardEntity[] {
    return [...this.cards].sort((a, b) => b.priority - a.priority);
  }

  onDrop(event: CdkDragDrop<TaskCardEntity[]>): void {
    this.dropped.emit(event);
  }
}
