import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { SignInEntity } from '../../domain/entity/sign-in.entity';
import { SignInRepository } from '../../domain/repository/sign-in.repository';
import { SignInLocalDataSource } from '../data_source/local/sign-in-local-datasource';
import { SignInRemoteDataSource } from '../data_source/remote/sign-in-remote-datasource';
import { SignInMapper } from '../mapper/sign-in.mapper';

@Injectable()
export class SignInImplementationRepository implements SignInRepository {
  constructor(
    private local: SignInLocalDataSource,
    private remote: SignInRemoteDataSource,
  ) {}

  signIn(code: string): Observable<SignInEntity> {
    const source = environment.useMock ? this.local.signIn(code) : this.remote.signIn(code);
    return source.pipe(map((model) => SignInMapper.toEntity(model)));
  }
}
