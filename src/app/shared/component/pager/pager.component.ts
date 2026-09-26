import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-pager',
  imports: [ButtonComponent],
  templateUrl: './pager.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PagerComponent {
  readonly page = input.required<number>();
  readonly pageSize = input.required<number>();
  readonly totalCount = input.required<number>();

  readonly pageChange = output<number>();

  readonly totalPages = computed(() => {
    const size = this.pageSize();
    const total = this.totalCount();
    if (size <= 0 || total <= 0) {
      return 1;
    }
    return Math.max(1, Math.ceil(total / size));
  });

  readonly visible = computed(() => this.totalCount() > this.pageSize());

  onPrev(): void {
    const next = this.page() - 1;
    if (next >= 1) {
      this.pageChange.emit(next);
    }
  }

  onNext(): void {
    const next = this.page() + 1;
    if (next <= this.totalPages()) {
      this.pageChange.emit(next);
    }
  }
}
