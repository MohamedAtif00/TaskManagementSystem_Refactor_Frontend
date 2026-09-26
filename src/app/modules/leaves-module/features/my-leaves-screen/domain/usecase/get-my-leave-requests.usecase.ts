import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseUseCase } from '@core/base/usecase/base-usecase';
import { MyLeaveListParams, MyLeaveRequestPage } from '../entity/my-leaves.entity';
import { MyLeavesRepository } from '../repository/my-leaves.repository';

@Injectable()
export class GetMyLeaveRequestsUseCase implements BaseUseCase<MyLeaveListParams, MyLeaveRequestPage> {
  constructor(private repository: MyLeavesRepository) {}

  execute(params: MyLeaveListParams): Observable<MyLeaveRequestPage> {
    return this.repository.getRequests(params);
  }
}
