import { Injectable, computed, inject, signal } from '@angular/core';
import { ThemeService } from '@core/services/theme.service';

const STORAGE_KEY = 'tms-lo-code-display';

@Injectable({
  providedIn: 'root',
})
export class LoCodeDisplayService {
  private readonly themeService = inject(ThemeService);
  readonly showMapped = signal(false);
  readonly view = computed(() => ({
    showMapped: this.showMapped(),
    direction: this.themeService.theme().direction,
  }));

  constructor() {
    this.showMapped.set(localStorage.getItem(STORAGE_KEY) === 'mapped');
  }

  setShowMapped(value: boolean): void {
    this.showMapped.set(value);
    localStorage.setItem(STORAGE_KEY, value ? 'mapped' : 'code');
  }
}
