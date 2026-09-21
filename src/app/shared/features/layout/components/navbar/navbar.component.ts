import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { PermissionCodes } from '@core/models/permission-codes';
import { ROUTE_PATHS } from '@core/navigation/route-paths.const';
import { AuthService } from '@core/services/auth.service';
import { MenuService } from '@core/services/menu.service';
import { NavbarMenuComponent } from './navbar-menu/navbar-menu.component';
import { NavbarMobileComponent } from './navbar-mobile/navbar-mobile.component';
import { ProfileMenuComponent } from './profile-menu/profile-menu.component';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  imports: [AngularSvgIconModule, RouterLink, NavbarMenuComponent, ProfileMenuComponent, NavbarMobileComponent],
})
export class NavbarComponent {
  readonly notificationsPath = ROUTE_PATHS.notifications;

  constructor(
    private menuService: MenuService,
    public auth: AuthService,
  ) {}

  get canSeeNotifications(): boolean {
    return this.auth.hasPermission(PermissionCodes.Notifications.Read);
  }

  public toggleMobileMenu(): void {
    this.menuService.showMobileMenu = true;
  }
}
