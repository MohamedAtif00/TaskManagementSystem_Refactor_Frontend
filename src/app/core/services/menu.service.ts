import { Injectable, OnDestroy, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Menu } from '../constants/menu';
import { MenuItem, SubMenuItem } from '../models/menu.model';
import { hasAnyPermission } from '../models/permission-codes';
import { UserRole } from '../models/user-role';

@Injectable({
  providedIn: 'root',
})
export class MenuService implements OnDestroy {
  private _showSidebar = signal(true);
  private _showMobileMenu = signal(false);
  private _pagesMenu = signal<MenuItem[]>([]);
  private _navbarMenu = signal<MenuItem[]>([]);
  private _subscription = new Subscription();
  private currentRole: UserRole | null = null;
  private currentPermissions: string[] = [];

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
  get navbarMenu() {
    return this._navbarMenu();
  }

  set showSideBar(value: boolean) {
    this._showSidebar.set(value);
  }
  set showMobileMenu(value: boolean) {
    this._showMobileMenu.set(value);
  }

  public applyRole(role: UserRole | null): void {
    this.applyAccess(role, this.currentPermissions);
  }

  public applyAccess(role: UserRole | null, permissions: string[] = []): void {
    this.currentRole = role;
    this.currentPermissions = permissions;
    const accessible = this.filterByAccess(Menu.pages, role, permissions);
    this._pagesMenu.set(this.filterBySurface(accessible, 'sidebar'));
    this._navbarMenu.set(this.filterBySurface(accessible, 'navbar'));
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

  private filterBySurface(pages: MenuItem[], surface: 'sidebar' | 'navbar'): MenuItem[] {
    const visible = (item: SubMenuItem): boolean =>
      surface === 'sidebar' ? item.showInSidebar !== false : item.showInNavbar !== false;

    return pages
      .map((group) => ({
        ...group,
        items: group.items
          .filter(visible)
          .map((item) => ({
            ...item,
            children: item.children?.filter(visible),
          })),
      }))
      .filter((group) => group.items.length > 0);
  }

  private filterByAccess(pages: MenuItem[], role: UserRole | null, permissions: string[]): MenuItem[] {
    return pages
      .map((group) => ({
        ...group,
        items: group.items
          .filter((item) => this.canSee(item, role, permissions))
          .map((item) => ({
            ...item,
            children: item.children?.filter((child) => this.canSee(child, role, permissions)),
          })),
      }))
      .filter((group) => group.items.length > 0);
  }

  private canSee(item: SubMenuItem, role: UserRole | null, permissions: string[]): boolean {
    const roleOk = !item.roles?.length || (role !== null && item.roles.includes(role));
    const hasPermissionCatalog = permissions.length > 0;
    const permOk =
      !item.permissions?.length ||
      (hasPermissionCatalog ? hasAnyPermission(permissions, item.permissions) : roleOk);

    if (item.permissions?.length && item.roles?.length && hasPermissionCatalog) {
      return permOk && roleOk;
    }
    if (item.permissions?.length && hasPermissionCatalog) {
      return permOk;
    }
    return roleOk;
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
