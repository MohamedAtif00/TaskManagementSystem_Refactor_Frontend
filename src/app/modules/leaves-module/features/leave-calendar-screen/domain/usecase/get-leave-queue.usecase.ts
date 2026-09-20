import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseUseCase } from '@core/base/usecase/base-usecase';
import { LeaveKind, LeaveQueueFilters, LeaveQueueItem } from '../entity/leave-calendar.entity';
import { LeaveCalendarRepository } from '../repository/leave-calendar.repository';

export interface GetLeaveQueueParams {
  kind: LeaveKind;
  filters: LeaveQueueFilters;
}

@Injectable()
export class GetLeaveQueueUseCase implements BaseUseCase<GetLeaveQueueParams, LeaveQueueItem[]> {
  constructor(private repository: LeaveCalendarRepository) {}

  execute(params: GetLeaveQueueParams): Observable<LeaveQueueItem[]> {
    return this.repository.getQueue(params.kind, params.filters);
  }
}
