import { NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { MenuService } from '@core/services/menu.service';
import { NavbarMobileMenuComponent } from './navbar-mobile-menu.component';

@Component({
  selector: 'app-navbar-mobile',
  templateUrl: './navbar-mobile.component.html',
  imports: [NgClass, AngularSvgIconModule, NavbarMobileMenuComponent],
})
export class NavbarMobileComponent {
  constructor(public menuService: MenuService) {}

  public toggleMobileMenu(): void {
    this.menuService.showMobileMenu = false;
  }
}
