import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseUseCase } from '@core/base/usecase/base-usecase';
import { HolidayListRepository } from '../repository/holiday-list.repository';

@Injectable()
export class DeleteHolidayUseCase implements BaseUseCase<number, void> {
  constructor(private repository: HolidayListRepository) {}

  execute(id: number): Observable<void> {
    return this.repository.remove(id);
  }
}
