import { Injectable, computed, signal } from '@angular/core';
import { catchError, of } from 'rxjs';
import { AuthUser } from '../models/auth-user.model';
import { ROLE_LABELS, UserRole } from '../models/user-role';
import { API } from '../network/api/api.const';
import { NetworkService } from '../network/network.service';
import { MenuService } from './menu.service';

const TOKEN_KEY = 'access-token';
const USER_KEY = 'tms-user';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly _user = signal<AuthUser | null>(null);

  readonly user = this._user.asReadonly();
  readonly roleLabel = computed(() => {
    const user = this._user();
    return user ? ROLE_LABELS[user.role] : '';
  });

  constructor(
    private menuService: MenuService,
    private network: NetworkService,
  ) {
    this.restoreSession();
  }

  isAuthenticated(): boolean {
    return !!this._user() && this.isJwt(localStorage.getItem(TOKEN_KEY));
  }

  hasRole(roles: UserRole[]): boolean {
    const user = this._user();
    return !!user && roles.includes(user.role);
  }

  setSession(user: AuthUser): void {
    localStorage.setItem(TOKEN_KEY, user.token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    this._user.set(user);
    this.menuService.applyRole(user.role);
  }

  logout(): void {
    this.network.post(API.Auth.Logout).pipe(catchError(() => of(null))).subscribe();
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this._user.set(null);
    this.menuService.applyRole(null);
  }

  getToken(): string | null {
    const token = localStorage.getItem(TOKEN_KEY);
    return this.isJwt(token) ? token : null;
  }

  private isJwt(token: string | null): boolean {
    return !!token && token.includes('.');
  }

  private restoreSession(): void {
    const raw = localStorage.getItem(USER_KEY);
    const token = localStorage.getItem(TOKEN_KEY);
    if (!raw || !this.isJwt(token)) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      this.menuService.applyRole(null);
      return;
    }

    try {
      const user = JSON.parse(raw) as AuthUser;
      this._user.set(user);
      this.menuService.applyRole(user.role);
    } catch {
      this.logout();
    }
  }
}
