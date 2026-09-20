import { Observable } from 'rxjs';

export type NoParam = void;

export interface BaseUseCase<S, T> {
  execute(params: S): Observable<T>;
}
