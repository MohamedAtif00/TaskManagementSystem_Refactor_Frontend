import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseUseCase } from '@core/base/usecase/base-usecase';
import { DecidePayload } from '../entity/leave-calendar.entity';
import { LeaveCalendarRepository } from '../repository/leave-calendar.repository';

@Injectable()
export class DecideLeaveUseCase implements BaseUseCase<DecidePayload, void> {
  constructor(private repository: LeaveCalendarRepository) {}

  execute(params: DecidePayload): Observable<void> {
    return this.repository.decide(params);
  }
}
