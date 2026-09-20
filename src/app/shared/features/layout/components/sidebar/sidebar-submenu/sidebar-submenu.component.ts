import { NgClass, NgTemplateOutlet } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { SubMenuItem } from '@core/models/menu.model';
import { MenuService } from '@core/services/menu.service';

@Component({
  selector: 'app-sidebar-submenu',
  templateUrl: './sidebar-submenu.component.html',
  imports: [NgClass, NgTemplateOutlet, RouterLinkActive, RouterLink, AngularSvgIconModule],
})
export class SidebarSubmenuComponent {
  @Input() public submenu = <SubMenuItem>{};

  constructor(public menuService: MenuService) {}

  public toggleMenu(menu: SubMenuItem) {
    this.menuService.toggleSubMenu(menu);
  }
}
