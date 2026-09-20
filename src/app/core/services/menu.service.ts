import { Injectable, OnDestroy, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Menu } from '../constants/menu';
import { MenuItem, SubMenuItem } from '../models/menu.model';
import { UserRole } from '../models/user-role';

@Injectable({
  providedIn: 'root',
})
export class MenuService implements OnDestroy {
  private _showSidebar = signal(true);
  private _showMobileMenu = signal(false);
  private _pagesMenu = signal<MenuItem[]>([]);
  private _subscription = new Subscription();

  constructor(private router: Router) {
    const sub = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.markActive();
      }
    });
    this._subscription.add(sub);
  }

  get showSideBar() {
    return this._showSidebar();
  }
  get showMobileMenu() {
    return this._showMobileMenu();
  }
  get pagesMenu() {
    return this._pagesMenu();
  }

  set showSideBar(value: boolean) {
    this._showSidebar.set(value);
  }
  set showMobileMenu(value: boolean) {
    this._showMobileMenu.set(value);
  }

  public applyRole(role: UserRole | null): void {
    this._pagesMenu.set(this.filterByRole(Menu.pages, role));
    this.markActive();
  }

  public toggleSidebar() {
    this._showSidebar.set(!this._showSidebar());
  }

  public toggleMenu(menu: SubMenuItem) {
    this.showSideBar = true;

    const updatedMenu = this._pagesMenu().map((menuGroup) => {
      return {
        ...menuGroup,
        items: menuGroup.items.map((item) => {
          return {
            ...item,
            expanded: item === menu ? !item.expanded : false,
          };
        }),
      };
    });

    this._pagesMenu.set(updatedMenu);
  }

  public toggleSubMenu(submenu: SubMenuItem) {
    submenu.expanded = !submenu.expanded;
  }

  private filterByRole(pages: MenuItem[], role: UserRole | null): MenuItem[] {
    return pages
      .map((group) => ({
        ...group,
        items: group.items
          .filter((item) => this.canSee(item, role))
          .map((item) => ({
            ...item,
            children: item.children?.filter((child) => this.canSee(child, role)),
          })),
      }))
      .filter((group) => group.items.length > 0);
  }

  private canSee(item: SubMenuItem, role: UserRole | null): boolean {
    if (!item.roles || item.roles.length === 0) {
      return true;
    }
    return role !== null && item.roles.includes(role);
  }

  private markActive() {
    this._pagesMenu().forEach((menu) => {
      let activeGroup = false;
      menu.items.forEach((subMenu) => {
        const active = this.isActive(subMenu.route);
        subMenu.expanded = active;
        subMenu.active = active;
        if (active) activeGroup = true;
        if (subMenu.children) {
          this.expand(subMenu.children);
        }
      });
      menu.active = activeGroup;
    });
  }

  private expand(items: Array<SubMenuItem>) {
    items.forEach((item) => {
      item.expanded = this.isActive(item.route);
      if (item.children) this.expand(item.children);
    });
  }

  public isActive(instruction: unknown): boolean {
    return this.router.isActive(this.router.createUrlTree([instruction]), {
      paths: 'subset',
      queryParams: 'subset',
      fragment: 'ignored',
      matrixParams: 'ignored',
    });
  }

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }
}
