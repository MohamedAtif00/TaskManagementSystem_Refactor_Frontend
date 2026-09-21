import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TaskCardEntity } from '../domain/entity/task-board.entity';
import { ButtonComponent } from '@shared/component/button/button.component';
import { TaskCardComponent } from './task-card.component';

@Component({
  selector: 'app-task-column',
  imports: [DragDropModule, ButtonComponent, TaskCardComponent],
  templateUrl: './task-column.component.html',
})
export class TaskColumnComponent {
  @Input({ required: true }) label = '';
  @Input({ required: true }) columnKey = '';
  @Input() cards: TaskCardEntity[] = [];
  @Input() totalCount = 0;
  @Input() page = 1;
  @Input() pageSize = 10;
  @Output() openCard = new EventEmitter<TaskCardEntity>();
  @Output() dropped = new EventEmitter<CdkDragDrop<TaskCardEntity[]>>();
  @Output() pageChange = new EventEmitter<number>();

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalCount / this.pageSize));
  }

  get showPager(): boolean {
    return this.totalCount > this.pageSize;
  }

  sorted(): TaskCardEntity[] {
    return [...this.cards].sort((a, b) => b.priority - a.priority);
  }

  onDrop(event: CdkDragDrop<TaskCardEntity[]>): void {
    this.dropped.emit(event);
  }

  prev(): void {
    if (this.page > 1) {
      this.pageChange.emit(this.page - 1);
    }
  }

  next(): void {
    if (this.page < this.totalPages) {
      this.pageChange.emit(this.page + 1);
    }
  }
}
