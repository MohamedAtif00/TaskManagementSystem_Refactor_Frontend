import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseUseCase } from '@core/base/usecase/base-usecase';
import { HolidayEntity, HolidayFormPayload, HolidayListPage, HolidayListParams } from '../entity/holidays.entity';
import { HolidaysRepository } from '../repository/holidays.repository';

@Injectable()
export class ListHolidaysUseCase implements BaseUseCase<HolidayListParams, HolidayListPage> {
  constructor(private repository: HolidaysRepository) {}
  execute(params: HolidayListParams): Observable<HolidayListPage> {
    return this.repository.list(params);
  }
}

@Injectable()
export class SaveHolidayUseCase implements BaseUseCase<HolidayFormPayload, HolidayEntity> {
  constructor(private repository: HolidaysRepository) {}
  execute(params: HolidayFormPayload): Observable<HolidayEntity> {
    return this.repository.save(params);
  }
}

@Injectable()
export class DeleteHolidayUseCase implements BaseUseCase<number, void> {
  constructor(private repository: HolidaysRepository) {}
  execute(id: number): Observable<void> {
    return this.repository.remove(id);
  }
}
