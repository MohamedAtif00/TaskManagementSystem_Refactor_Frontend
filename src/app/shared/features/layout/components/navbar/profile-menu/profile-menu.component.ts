import { animate, state, style, transition, trigger } from '@angular/animations';
import { NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { Theme } from '@core/models/theme.model';
import { AuthService } from '@core/services/auth.service';
import { ThemeService } from '@core/services/theme.service';
import { ROUTE_PATHS } from '@core/navigation/route-paths.const';
import { ClickOutsideDirective } from '@shared/directives/click-outside.directive';

@Component({
  selector: 'app-profile-menu',
  templateUrl: './profile-menu.component.html',
  imports: [ClickOutsideDirective, NgClass, AngularSvgIconModule],
  animations: [
    trigger('openClose', [
      state(
        'open',
        style({
          opacity: 1,
          transform: 'translateY(0)',
          visibility: 'visible',
        }),
      ),
      state(
        'closed',
        style({
          opacity: 0,
          transform: 'translateY(-20px)',
          visibility: 'hidden',
        }),
      ),
      transition('open => closed', [animate('0.2s')]),
      transition('closed => open', [animate('0.2s')]),
    ]),
  ],
})
export class ProfileMenuComponent {
  public isOpen = false;

  public themeColors = [
    { name: 'base', code: '#e11d48' },
    { name: 'yellow', code: '#f59e0b' },
    { name: 'green', code: '#22c55e' },
    { name: 'blue', code: '#3b82f6' },
    { name: 'orange', code: '#ea580c' },
    { name: 'red', code: '#cc0022' },
    { name: 'violet', code: '#6d28d9' },
  ];

  public themeMode = ['light', 'dark'];
  public themeDirection = ['ltr', 'rtl'];

  constructor(
    public themeService: ThemeService,
    public authService: AuthService,
    private router: Router,
  ) {}

  public toggleMenu(): void {
    this.isOpen = !this.isOpen;
  }

  toggleThemeMode() {
    this.themeService.theme.update((theme: Theme) => {
      const mode = !this.themeService.isDark ? 'dark' : 'light';
      return { ...theme, mode: mode };
    });
  }

  toggleThemeColor(color: string) {
    this.themeService.theme.update((theme: Theme) => {
      return { ...theme, color: color };
    });
  }

  setDirection(value: string) {
    this.themeService.theme.update((theme: Theme) => {
      return { ...theme, direction: value };
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate([ROUTE_PATHS.signIn]);
  }
}
