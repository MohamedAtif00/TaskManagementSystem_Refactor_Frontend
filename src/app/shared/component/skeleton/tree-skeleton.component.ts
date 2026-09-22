import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { SkeletonBlockComponent } from './skeleton-block.component';

@Component({
  selector: 'app-tree-skeleton',
  imports: [SkeletonBlockComponent],
  template: `
    <div class="border-border/60 bg-card space-y-3 rounded-xl border p-4 shadow-sm">
      @for (row of rowItems(); track row) {
        <div class="flex items-center gap-3" [style.paddingLeft.px]="indentFor(row)">
          <app-skeleton-block className="h-4 w-4 shrink-0" />
          <app-skeleton-block className="h-3 w-20" />
          <app-skeleton-block className="h-4 flex-1" />
          <app-skeleton-block className="h-3 w-16" />
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TreeSkeletonComponent {
  rows = input(8);

  rowItems(): number[] {
    return Array.from({ length: this.rows() }, (_, index) => index);
  }

  indentFor(index: number): number {
    return (index % 3) * 16;
  }
}
