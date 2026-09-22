import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { SkeletonBlockComponent } from './skeleton-block.component';

@Component({
  selector: 'app-chart-skeleton',
  imports: [SkeletonBlockComponent],
  template: `
    <div class="border-border/60 bg-card rounded-xl border p-5 shadow-sm">
      <app-skeleton-block className="mb-1 h-4 w-40" />
      <app-skeleton-block className="mb-4 h-3 w-56" />
      <app-skeleton-block [className]="'w-full rounded-lg'" [height]="height()" />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChartSkeletonComponent {
  height = input('280px');
}
