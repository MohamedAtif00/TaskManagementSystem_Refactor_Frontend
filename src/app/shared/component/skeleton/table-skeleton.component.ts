import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { SkeletonBlockComponent } from './skeleton-block.component';

@Component({
  selector: 'app-table-skeleton',
  imports: [SkeletonBlockComponent],
  template: `
    <div class="border-border/60 bg-card shadow-sm overflow-hidden rounded-xl border">
      @if (showHeader()) {
        <div class="border-muted/20 flex gap-3 border-b px-5 py-3">
          @for (col of columnItems(); track col) {
            <app-skeleton-block className="h-3 flex-1" />
          }
        </div>
      }
      <div class="divide-muted/10 divide-y px-5">
        @for (row of rowItems(); track row) {
          <div class="flex items-center gap-3 py-4">
            @for (col of columnItems(); track col) {
              <app-skeleton-block [className]="col === 0 ? 'h-4 flex-[1.2]' : 'h-4 flex-1'" />
            }
          </div>
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableSkeletonComponent {
  rows = input(6);
  columns = input(5);
  showHeader = input(true);

  rowItems(): number[] {
    return Array.from({ length: this.rows() }, (_, index) => index);
  }

  columnItems(): number[] {
    return Array.from({ length: this.columns() }, (_, index) => index);
  }
}
