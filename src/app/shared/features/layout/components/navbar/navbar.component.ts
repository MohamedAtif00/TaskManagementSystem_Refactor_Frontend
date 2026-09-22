import { Component } from '@angular/core';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { MenuService } from '@core/services/menu.service';
import { NavbarMobileComponent } from './navbar-mobile/navbar-mobile.component';
import { NotificationBellComponent } from './notification-bell/notification-bell.component';
import { ProfileMenuComponent } from './profile-menu/profile-menu.component';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  imports: [AngularSvgIconModule, ProfileMenuComponent, NavbarMobileComponent, NotificationBellComponent],
})
export class NavbarComponent {
  constructor(private menuService: MenuService) {}

  public toggleMobileMenu(): void {
    this.menuService.showMobileMenu = true;
  }
}
