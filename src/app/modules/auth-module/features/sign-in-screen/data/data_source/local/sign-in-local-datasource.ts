import { Observable } from 'rxjs';
import { SignInModel } from '../../model/sign-in.model';

export abstract class SignInLocalDataSource {
  abstract signIn(code: string): Observable<SignInModel>;
}
