import { Injectable, computed, signal } from '@angular/core';
import { Observable, catchError, of, shareReplay, tap, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { AccessTokenResponse } from '../api/tms-contracts';
import { AuthUser } from '../models/auth-user.model';
import { hasAnyPermission, permissionSatisfied } from '../models/permission-codes';
import { ROLE_LABELS, UserRole } from '../models/user-role';
import { API } from '../network/api/api.const';
import { NetworkService } from '../network/network.service';
import { MenuService } from './menu.service';

export const TOKEN_KEY = 'access-token';
export const USER_KEY = 'tms-user';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly _user = signal<AuthUser | null>(null);
  private refreshInFlight$: Observable<string> | null = null;

  readonly user = this._user.asReadonly();
  readonly roleLabel = computed(() => {
    const user = this._user();
    return user ? ROLE_LABELS[user.role] : '';
  });
  readonly unreadNotifications = computed(() => this._user()?.notifications ?? 0);

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

  hasPermission(code: string): boolean {
    return permissionSatisfied(this._user()?.permissions ?? [], code);
  }

  hasAnyPermission(codes: string[]): boolean {
    return hasAnyPermission(this._user()?.permissions ?? [], codes);
  }

  setSession(user: AuthUser): void {
    const next: AuthUser = {
      ...user,
      permissions: user.permissions ?? [],
      notifications: user.notifications ?? 0,
    };
    localStorage.setItem(TOKEN_KEY, next.token);
    localStorage.setItem(USER_KEY, JSON.stringify(next));
    this._user.set(next);
    this.menuService.applyAccess(next.role, next.permissions);
  }

  setUnreadNotifications(count: number): void {
    const user = this._user();
    if (!user) {
      return;
    }
    this.setSession({ ...user, notifications: count });
  }

  logout(): void {
    this.network.post(API.Auth.Logout).pipe(catchError(() => of(null))).subscribe();
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this._user.set(null);
    this.menuService.applyAccess(null, []);
  }

  getToken(): string | null {
    const token = localStorage.getItem(TOKEN_KEY);
    return this.isJwt(token) ? token : null;
  }

  refreshAccessToken(): Observable<string> {
    if (this.refreshInFlight$) {
      return this.refreshInFlight$;
    }

    this.refreshInFlight$ = this.network.post<AccessTokenResponse>(API.Auth.Refresh).pipe(
      map((response) => response.accessToken),
      tap((token) => {
        const user = this._user();
        localStorage.setItem(TOKEN_KEY, token);
        if (user) {
          this.setSession({ ...user, token });
        }
      }),
      catchError((err) => {
        this.refreshInFlight$ = null;
        return throwError(() => err);
      }),
      tap({
        complete: () => {
          this.refreshInFlight$ = null;
        },
      }),
      shareReplay(1),
    );

    return this.refreshInFlight$;
  }

  isJwt(token: string | null): boolean {
    return !!token && token.includes('.');
  }

  private restoreSession(): void {
    const raw = localStorage.getItem(USER_KEY);
    const token = localStorage.getItem(TOKEN_KEY);
    if (!raw || !this.isJwt(token)) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      this.menuService.applyAccess(null, []);
      return;
    }

    try {
      const user = JSON.parse(raw) as AuthUser;
      user.permissions ??= [];
      user.notifications ??= 0;
      user.token = token!;
      this._user.set(user);
      this.menuService.applyAccess(user.role, user.permissions);
    } catch {
      this.logout();
    }
  }
}
