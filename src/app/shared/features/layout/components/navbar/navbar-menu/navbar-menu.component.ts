import { NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { MenuService } from '@core/services/menu.service';
import { NavbarSubmenuComponent } from '../navbar-submenu/navbar-submenu.component';

@Component({
  selector: 'app-navbar-menu',
  templateUrl: './navbar-menu.component.html',
  imports: [NgClass, NavbarSubmenuComponent],
})
export class NavbarMenuComponent {
  constructor(public menuService: MenuService) {}
}
