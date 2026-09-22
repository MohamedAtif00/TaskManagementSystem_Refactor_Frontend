import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseUseCase } from '@core/base/usecase/base-usecase';
import { TaskSheetEntity } from '../entity/task-sheet.entity';
import { TaskSheetParams, TaskSheetRepository } from '../repository/task-sheet.repository';

@Injectable()
export class GetTaskSheetUseCase implements BaseUseCase<TaskSheetParams, TaskSheetEntity> {
  constructor(private repository: TaskSheetRepository) {}

  execute(params: TaskSheetParams): Observable<TaskSheetEntity> {
    return this.repository.getSheet(params);
  }
}
