import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseUseCase } from '@core/base/usecase/base-usecase';
import { LeaveKind, LeaveQueueItem } from '../entity/leave-calendar.entity';
import { LeaveCalendarRepository } from '../repository/leave-calendar.repository';

export interface GetLeaveDetailsParams {
  kind: LeaveKind;
  id: number;
}

@Injectable()
export class GetLeaveDetailsUseCase implements BaseUseCase<GetLeaveDetailsParams, LeaveQueueItem> {
  constructor(private repository: LeaveCalendarRepository) {}

  execute(params: GetLeaveDetailsParams): Observable<LeaveQueueItem> {
    return this.repository.getDetails(params.kind, params.id);
  }
}
