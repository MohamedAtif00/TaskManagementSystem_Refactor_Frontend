import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TaskCardEntity } from '../domain/entity/task-board.entity';
import { TaskCardComponent } from './task-card.component';

@Component({
  selector: 'app-task-column',
  imports: [TaskCardComponent],
  templateUrl: './task-column.component.html',
})
export class TaskColumnComponent {
  @Input({ required: true }) label = '';
  @Input() cards: TaskCardEntity[] = [];
  @Output() openCard = new EventEmitter<TaskCardEntity>();

  sorted(): TaskCardEntity[] {
    return [...this.cards].sort((a, b) => b.priority - a.priority);
  }
}
