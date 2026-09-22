import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-skeleton-block',
  template: `<div class="animate-pulse rounded-md bg-muted/60" [class]="className()" [style.height]="height()" [style.width]="width()"></div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkeletonBlockComponent {
  className = input('h-4 w-full');
  height = input<string | null>(null);
  width = input<string | null>(null);
}
