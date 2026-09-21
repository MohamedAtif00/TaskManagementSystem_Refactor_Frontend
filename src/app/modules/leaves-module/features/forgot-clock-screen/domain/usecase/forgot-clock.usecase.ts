import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseUseCase } from '@core/base/usecase/base-usecase';
import { CreateForgotClockForm, ForgotClockEntity } from '../entity/forgot-clock.entity';
import { ForgotClockRepository } from '../repository/forgot-clock.repository';

@Injectable()
export class ListForgotClockUseCase implements BaseUseCase<void, ForgotClockEntity[]> {
  constructor(private repository: ForgotClockRepository) {}
  execute(): Observable<ForgotClockEntity[]> {
    return this.repository.listMine();
  }
}

@Injectable()
export class CreateForgotClockRequestUseCase implements BaseUseCase<CreateForgotClockForm, void> {
  constructor(private repository: ForgotClockRepository) {}
  execute(params: CreateForgotClockForm): Observable<void> {
    return this.repository.create(params);
  }
}

@Injectable()
export class CancelForgotClockUseCase implements BaseUseCase<number, void> {
  constructor(private repository: ForgotClockRepository) {}
  execute(id: number): Observable<void> {
    return this.repository.cancel(id);
  }
}
