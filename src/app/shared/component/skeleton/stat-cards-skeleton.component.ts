import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { SkeletonBlockComponent } from './skeleton-block.component';

@Component({
  selector: 'app-stat-cards-skeleton',
  imports: [SkeletonBlockComponent],
  template: `
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      @for (item of items(); track item) {
        <div class="border-border/60 bg-card flex flex-col rounded-xl border p-5 shadow-sm">
          <div class="flex items-start justify-between">
            <div class="w-full space-y-3">
              <app-skeleton-block className="h-3 w-20" />
              <app-skeleton-block className="h-8 w-16" />
            </div>
            <app-skeleton-block className="h-9 w-9 shrink-0 rounded-md" />
          </div>
          <app-skeleton-block className="mt-3 h-3 w-24" />
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatCardsSkeletonComponent {
  count = input(4);

  items(): number[] {
    return Array.from({ length: this.count() }, (_, index) => index);
  }
}
