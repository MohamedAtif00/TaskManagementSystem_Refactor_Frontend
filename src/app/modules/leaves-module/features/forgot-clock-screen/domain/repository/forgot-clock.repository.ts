import { Observable } from 'rxjs';
import { CreateForgotClockForm, ForgotClockEntity } from '../entity/forgot-clock.entity';

export abstract class ForgotClockRepository {
  abstract listMine(): Observable<ForgotClockEntity[]>;
  abstract create(payload: CreateForgotClockForm): Observable<void>;
  abstract cancel(id: number): Observable<void>;
}
