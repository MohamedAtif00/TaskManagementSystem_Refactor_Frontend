import { NgTemplateOutlet } from '@angular/common';
import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { SubMenuItem } from '@core/models/menu.model';

@Component({
  selector: 'div[navbar-submenu]',
  templateUrl: './navbar-submenu.component.html',
  imports: [NgTemplateOutlet, RouterLinkActive, RouterLink, AngularSvgIconModule],
})
export class NavbarSubmenuComponent implements AfterViewInit {
  @Input() public submenu: SubMenuItem[] = [];
  @ViewChild('submenuRef') submenuRef: ElementRef<HTMLDivElement> | undefined;

  ngAfterViewInit() {
    if (this.submenuRef) {
      const submenu = this.submenuRef.nativeElement.getBoundingClientRect();
      const bounding = document.body.getBoundingClientRect();

      if (submenu.right > bounding.right) {
        const childrenElement = this.submenuRef.nativeElement.parentNode as HTMLElement;
        if (childrenElement) {
          childrenElement.style.left = '-100%';
        }
      }
    }
  }
}
