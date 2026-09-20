import { NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { MenuService } from '@core/services/menu.service';
import { SidebarMenuComponent } from './sidebar-menu/sidebar-menu.component';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  imports: [NgClass, AngularSvgIconModule, SidebarMenuComponent],
})
export class SidebarComponent {
  constructor(public menuService: MenuService) {}

  public toggleSidebar() {
    this.menuService.toggleSidebar();
  }
}
