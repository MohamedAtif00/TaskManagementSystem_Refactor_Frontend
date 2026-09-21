import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseUseCase } from '@core/base/usecase/base-usecase';
import { HolidayEntity, HolidayFormPayload } from '../entity/holiday-list.entity';
import { HolidayListRepository } from '../repository/holiday-list.repository';

@Injectable()
export class SaveHolidayUseCase implements BaseUseCase<HolidayFormPayload, HolidayEntity> {
  constructor(private repository: HolidayListRepository) {}

  execute(params: HolidayFormPayload): Observable<HolidayEntity> {
    return this.repository.save(params);
  }
}
