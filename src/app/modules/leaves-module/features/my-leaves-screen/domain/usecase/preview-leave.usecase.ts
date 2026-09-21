import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseUseCase } from '@core/base/usecase/base-usecase';
import { CreateLeavePayload, LeavePreviewEntity } from '../entity/my-leaves.entity';
import { MyLeavesRepository } from '../repository/my-leaves.repository';

@Injectable()
export class PreviewLeaveUseCase
  implements BaseUseCase<Pick<CreateLeavePayload, 'startDate' | 'endDate'>, LeavePreviewEntity>
{
  constructor(private repository: MyLeavesRepository) {}

  execute(params: Pick<CreateLeavePayload, 'startDate' | 'endDate'>): Observable<LeavePreviewEntity> {
    return this.repository.previewLeave(params);
  }
}
