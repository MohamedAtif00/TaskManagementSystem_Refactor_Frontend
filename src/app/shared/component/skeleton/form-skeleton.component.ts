import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { SkeletonBlockComponent } from './skeleton-block.component';

@Component({
  selector: 'app-form-skeleton',
  imports: [SkeletonBlockComponent],
  template: `
    <div class="space-y-3">
      @for (row of rowItems(); track row) {
        <div class="border-border/60 bg-card rounded-xl border p-4 shadow-sm">
          <app-skeleton-block className="mb-2 h-4 w-1/3" />
          <app-skeleton-block className="h-3 w-full" />
          <app-skeleton-block className="mt-2 h-3 w-2/3" />
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormSkeletonComponent {
  rows = input(5);

  rowItems(): number[] {
    return Array.from({ length: this.rows() }, (_, index) => index);
  }
}
