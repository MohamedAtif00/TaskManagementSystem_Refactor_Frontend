import { NgTemplateOutlet } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { SubMenuItem } from '@core/models/menu.model';
import { MenuService } from '@core/services/menu.service';
import { NavbarMobileSubmenuComponent } from './navbar-mobile-submenu.component';

@Component({
  selector: 'app-navbar-mobile-menu',
  templateUrl: './navbar-mobile-menu.component.html',
  imports: [AngularSvgIconModule, NgTemplateOutlet, RouterLink, RouterLinkActive, NavbarMobileSubmenuComponent],
})
export class NavbarMobileMenuComponent {
  constructor(public menuService: MenuService) {}

  public toggleMenu(subMenu: SubMenuItem) {
    this.menuService.toggleMenu(subMenu);
  }
}
