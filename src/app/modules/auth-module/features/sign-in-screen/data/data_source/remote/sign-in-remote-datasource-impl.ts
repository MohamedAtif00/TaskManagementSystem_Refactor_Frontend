import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { mapApiRole } from '@core/models/role-map';
import { API } from '@core/network/api/api.const';
import { mapHttpError } from '@core/network/http-error';
import { NetworkService } from '@core/network/network.service';
import { SignInModel } from '../../model/sign-in.model';
import { SignInRemoteDataSource } from './sign-in-remote-datasource';

const TOKEN_KEY = 'access-token';

interface LoginResponse {
  accessToken: string;
}

interface AboutMeResponse {
  id: number;
  name: string;
  role: number;
  roleName: string;
  group?: string | { name?: string } | null;
}

@Injectable()
export class SignInRemoteDataSourceImpl extends SignInRemoteDataSource {
  constructor(private network: NetworkService) {
    super();
  }

  signIn(code: string): Observable<SignInModel> {
    return this.network.post<LoginResponse>(API.Auth.Login, { code }).pipe(
      switchMap((login) => {
        localStorage.setItem(TOKEN_KEY, login.accessToken);
        return this.network.post<AboutMeResponse>(API.Auth.AboutMe).pipe(
          map((me) => ({
            id: me.id,
            name: me.name,
            code: code.trim().toUpperCase(),
            role: mapApiRole(me.role, me.roleName),
            group: typeof me.group === 'string' ? me.group : (me.group?.name ?? ''),
            token: login.accessToken,
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
