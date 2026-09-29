import { Component, inject } from '@angular/core';
import { HttpActivityService } from '@core/network/http-activity.service';

@Component({
  selector: 'app-loading-bar',
  template: `
    @if (activity.active()) {
      <div
        class="pointer-events-none fixed inset-x-0 top-0 z-[100] h-1 overflow-hidden bg-primary/20"
        role="progressbar"
        aria-label="Loading">
        <div class="loading-bar bg-primary h-full w-1/3"></div>
      </div>
    }
  `,
  styles: `
    .loading-bar {
      animation: loading-bar 1s ease-in-out infinite;
    }

    @keyframes loading-bar {
      0% {
        transform: translateX(-100%);
      }
      100% {
        transform: translateX(400%);
      }
    }
  `,
})
export class LoadingBarComponent {
  readonly activity = inject(HttpActivityService);
}
