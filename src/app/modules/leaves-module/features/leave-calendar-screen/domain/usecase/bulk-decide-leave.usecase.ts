import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseUseCase } from '@core/base/usecase/base-usecase';
import { BulkDecidePayload, BulkOpinionResult } from '../entity/leave-calendar.entity';
import { LeaveCalendarRepository } from '../repository/leave-calendar.repository';

@Injectable()
export class BulkDecideLeaveUseCase implements BaseUseCase<BulkDecidePayload, BulkOpinionResult> {
  constructor(private repository: LeaveCalendarRepository) {}

  execute(params: BulkDecidePayload): Observable<BulkOpinionResult> {
    return this.repository.bulkDecide(params);
  }
}
