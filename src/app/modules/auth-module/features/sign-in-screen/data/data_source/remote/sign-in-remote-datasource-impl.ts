import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { AuthInfoResponse, AccessTokenResponse } from '@core/api/tms-contracts';
import { mapApiRole } from '@core/models/role-map';
import { API } from '@core/network/api/api.const';
import { mapHttpError } from '@core/network/http-error';
import { NetworkService } from '@core/network/network.service';
import { SignInModel } from '../../model/sign-in.model';
import { SignInRemoteDataSource } from './sign-in-remote-datasource';

const TOKEN_KEY = 'access-token';

@Injectable()
export class SignInRemoteDataSourceImpl extends SignInRemoteDataSource {
  constructor(private network: NetworkService) {
    super();
  }

  signIn(code: string): Observable<SignInModel> {
    return this.network.post<AccessTokenResponse>(API.Auth.Login, { code }).pipe(
      switchMap((login) => {
        localStorage.setItem(TOKEN_KEY, login.accessToken);
        return this.network.post<AuthInfoResponse>(API.Auth.AboutMe).pipe(
          map((me) => ({
            id: me.id,
            name: me.name,
            code: code.trim().toUpperCase(),
            role: mapApiRole(me.role, me.roleName),
            group: typeof me.group === 'string' ? me.group : '',
            token: login.accessToken,
            permissions: me.permissions ?? [],
            notifications: me.notifications ?? 0,
          })),
        );
      }),
      catchError((err) => {
        localStorage.removeItem(TOKEN_KEY);
        return mapHttpError(err);
      }),
    );
  }
}
