import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseUseCase } from '@core/base/usecase/base-usecase';
import { HolidayEntity } from '../entity/holiday-list.entity';
import { HolidayListRepository } from '../repository/holiday-list.repository';

@Injectable()
export class ListHolidaysUseCase implements BaseUseCase<void, HolidayEntity[]> {
  constructor(private repository: HolidayListRepository) {}

  execute(): Observable<HolidayEntity[]> {
    return this.repository.list();
  }
}
