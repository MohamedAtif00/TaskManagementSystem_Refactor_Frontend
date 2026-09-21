import { Observable } from 'rxjs';
import { CreateForgotClockForm, ForgotClockEntity } from '../../domain/entity/forgot-clock.entity';

export abstract class ForgotClockRemoteDataSource {
  abstract listMine(): Observable<ForgotClockEntity[]>;
  abstract create(payload: CreateForgotClockForm): Observable<void>;
  abstract cancel(id: number): Observable<void>;
}

export abstract class ForgotClockLocalDataSource {
  abstract listMine(): Observable<ForgotClockEntity[]>;
  abstract create(payload: CreateForgotClockForm): Observable<void>;
  abstract cancel(id: number): Observable<void>;
}
