import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { TaskCardEntity } from '../domain/entity/task-board.entity';
import { TaskCardComponent } from './task-card.component';

@Component({
  selector: 'app-task-column',
  imports: [DragDropModule, TaskCardComponent],
  templateUrl: './task-column.component.html',
  host: {
    class: 'block min-h-[28rem] w-72 shrink-0',
  },
})
export class TaskColumnComponent implements OnChanges {
  @Input({ required: true }) label = '';
  @Input({ required: true }) columnKey = '';
  @Input() cards: TaskCardEntity[] = [];
  @Input() connectedTo: string[] = [];
  @Input() totalCount = 0;
  @Output() openCard = new EventEmitter<TaskCardEntity>();
  @Output() dropped = new EventEmitter<CdkDragDrop<TaskCardEntity[]>>();

  sortedCards: TaskCardEntity[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['cards']) {
      this.sortedCards = [...this.cards].sort((a, b) => b.priority - a.priority);
    }
  }

  onDrop(event: CdkDragDrop<TaskCardEntity[]>): void {
    this.dropped.emit(event);
  }
}
