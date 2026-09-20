import { NgClass } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { SubMenuItem } from '@core/models/menu.model';
import { MenuService } from '@core/services/menu.service';

@Component({
  selector: 'app-navbar-mobile-submenu',
  templateUrl: './navbar-mobile-submenu.component.html',
  imports: [NgClass, RouterLinkActive, RouterLink, AngularSvgIconModule],
})
export class NavbarMobileSubmenuComponent {
  @Input() public submenu = <SubMenuItem>{};

  constructor(public menuService: MenuService) {}

  public toggleMenu(menu: SubMenuItem) {
    this.menuService.toggleSubMenu(menu);
  }

  public closeMobileMenu() {
    this.menuService.showMobileMenu = false;
  }
}
