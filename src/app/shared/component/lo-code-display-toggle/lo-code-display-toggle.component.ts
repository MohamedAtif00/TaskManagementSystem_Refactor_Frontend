import { Component, inject } from '@angular/core';
import { LoCodeDisplayService } from '@core/lo-code/lo-code-display.service';

@Component({
  selector: 'app-lo-code-display-toggle',
  template: `
    <div class="border-border inline-flex overflow-hidden rounded-md border" role="group" aria-label="Learning objective display">
      <button
        type="button"
        class="px-2.5 py-1 text-xs font-semibold"
        [class.bg-primary]="!display.showMapped()"
        [class.text-primary-foreground]="!display.showMapped()"
        [class.text-muted-foreground]="display.showMapped()"
        [class.hover:bg-muted/50]="display.showMapped()"
        (click)="display.setShowMapped(false)">
        Code
      </button>
      <button
        type="button"
        class="px-2.5 py-1 text-xs font-semibold"
        [class.bg-primary]="display.showMapped()"
        [class.text-primary-foreground]="display.showMapped()"
        [class.text-muted-foreground]="!display.showMapped()"
        [class.hover:bg-muted/50]="!display.showMapped()"
        (click)="display.setShowMapped(true)">
        Mapped
      </button>
    </div>
  `,
})
export class LoCodeDisplayToggleComponent {
  readonly display = inject(LoCodeDisplayService);
}
