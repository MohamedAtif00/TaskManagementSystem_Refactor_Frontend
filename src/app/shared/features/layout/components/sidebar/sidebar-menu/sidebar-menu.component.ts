import { NgClass, NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { SubMenuItem } from '@core/models/menu.model';
import { ROUTE_PATHS } from '@core/navigation/route-paths.const';
import { AuthService } from '@core/services/auth.service';
import { MenuService } from '@core/services/menu.service';
import { SidebarSubmenuComponent } from '../sidebar-submenu/sidebar-submenu.component';

@Component({
  selector: 'app-sidebar-menu',
  templateUrl: './sidebar-menu.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgClass, AngularSvgIconModule, NgTemplateOutlet, RouterLink, RouterLinkActive, SidebarSubmenuComponent],
})
export class SidebarMenuComponent {
  readonly notificationsPath = ROUTE_PATHS.notifications;

  constructor(
    public menuService: MenuService,
    public auth: AuthService,
  ) {}

  public toggleMenu(subMenu: SubMenuItem) {
    this.menuService.toggleMenu(subMenu);
  }
}
