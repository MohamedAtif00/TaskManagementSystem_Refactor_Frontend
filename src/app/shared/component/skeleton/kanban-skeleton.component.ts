import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { SkeletonBlockComponent } from './skeleton-block.component';

@Component({
  selector: 'app-kanban-skeleton',
  imports: [SkeletonBlockComponent],
  template: `
    <div class="mb-4 flex flex-wrap items-end gap-3">
      <app-skeleton-block className="h-10 w-40" />
      <app-skeleton-block className="h-10 w-64" />
    </div>
    <div class="flex w-full max-w-full min-w-0 gap-4 overflow-x-auto pb-4">
      @for (column of columnItems(); track column) {
        <div class="bg-muted/40 flex min-h-[28rem] w-72 shrink-0 flex-col rounded-xl p-3">
          <div class="mb-3 flex items-center justify-between">
            <app-skeleton-block className="h-4 w-20" />
            <app-skeleton-block className="h-5 w-8 rounded-full" />
          </div>
          <div class="flex flex-col gap-3">
            @for (card of cardItems(); track card) {
              <div class="bg-card border-border rounded-lg border p-3 shadow-sm">
                <app-skeleton-block className="mb-2 h-4 w-3/4" />
                <app-skeleton-block className="mb-2 h-3 w-1/2" />
                <app-skeleton-block className="h-5 w-16 rounded-full" />
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block min-w-0 w-full',
  },
})
export class KanbanSkeletonComponent {
  columns = input(4);
  cardsPerColumn = input(3);

  columnItems(): number[] {
    return Array.from({ length: this.columns() }, (_, index) => index);
  }

  cardItems(): number[] {
    return Array.from({ length: this.cardsPerColumn() }, (_, index) => index);
  }
}
