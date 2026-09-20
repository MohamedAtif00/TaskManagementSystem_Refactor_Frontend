import { Injectable, effect, signal } from '@angular/core';
import { Theme } from '../models/theme.model';

const THEME_STORAGE_KEY = 'tms-theme';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  public theme = signal<Theme>({ mode: 'dark', color: 'base', direction: 'ltr' });

  constructor() {
    this.loadTheme();
    effect(() => {
      this.setConfig();
    });
  }

  private loadTheme() {
    const theme = localStorage.getItem(THEME_STORAGE_KEY);
    if (theme) {
      this.theme.set(JSON.parse(theme) as Theme);
    }
  }

  private setConfig() {
    this.setLocalStorage();
    this.setThemeClass();
    this.setRTL();
  }

  public get isDark(): boolean {
    return this.theme().mode == 'dark';
  }

  private setThemeClass() {
    document.querySelector('html')!.className = this.theme().mode;
    document.querySelector('html')!.setAttribute('data-theme', this.theme().color);
  }

  private setLocalStorage() {
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(this.theme()));
  }

  private setRTL() {
    document.querySelector('html')!.setAttribute('dir', this.theme().direction);
    this.setLocalStorage();
  }
}
