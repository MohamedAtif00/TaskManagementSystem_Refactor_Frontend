import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseUseCase } from '@core/base/usecase/base-usecase';
import { SignInEntity } from '../entity/sign-in.entity';
import { SignInRepository } from '../repository/sign-in.repository';

@Injectable()
export class SignInUseCase implements BaseUseCase<string, SignInEntity> {
  constructor(private repository: SignInRepository) {}

  execute(code: string): Observable<SignInEntity> {
    return this.repository.signIn(code.trim().toUpperCase());
  }
}
