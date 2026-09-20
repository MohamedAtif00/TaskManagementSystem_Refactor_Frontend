import { Observable } from 'rxjs';
import { SignInEntity } from '../entity/sign-in.entity';

export abstract class SignInRepository {
  abstract signIn(code: string): Observable<SignInEntity>;
}
