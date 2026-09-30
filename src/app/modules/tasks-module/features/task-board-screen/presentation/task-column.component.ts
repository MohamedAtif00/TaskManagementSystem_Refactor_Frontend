import { CdkDrag, CdkDragDrop, CdkDragEnd, DragDropModule } from '@angular/cdk/drag-drop';
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
  styles: [
    `
      .column-drop-forbidden {
        outline: 2px dashed #cc0033;
        outline-offset: -2px;
        background-color: rgb(204 0 51 / 0.1);
      }
    `,
  ],
})
export class TaskColumnComponent implements OnChanges {
  @Input({ required: true }) label = '';
  @Input({ required: true }) columnKey = '';
  @Input() cards: TaskCardEntity[] = [];
  @Input() connectedTo: string[] = [];
  @Input() acceptsFrom: string[] = [];
  @Input() dropForbidden = false;
  @Input() totalCount = 0;
  @Input() movingIds: ReadonlySet<number> = new Set();
  @Output() openCard = new EventEmitter<TaskCardEntity>();
  @Output() dropped = new EventEmitter<CdkDragDrop<TaskCardEntity[]>>();
  @Output() dragStarted = new EventEmitter<void>();
  @Output() dragEnded = new EventEmitter<CdkDragEnd<TaskCardEntity>>();

  sortedCards: TaskCardEntity[] = [];

  readonly canEnter = (drag: CdkDrag<TaskCardEntity>): boolean => {
    const sourceKey = drag.dropContainer?.id;
    if (!sourceKey || sourceKey === this.columnKey) {
      return true;
    }
    return this.acceptsFrom.includes(sourceKey);
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['cards']) {
      this.sortedCards = [...this.cards].sort((a, b) => b.priority - a.priority);
    }
  }

  onDrop(event: CdkDragDrop<TaskCardEntity[]>): void {
    this.dropped.emit(event);
  }
}
