import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseUseCase } from '@core/base/usecase/base-usecase';
import { TaskSheetEntity } from '../entity/task-sheet.entity';
import { TaskSheetRepository } from '../repository/task-sheet.repository';

@Injectable()
export class GetTaskSheetUseCase implements BaseUseCase<number, TaskSheetEntity> {
  constructor(private repository: TaskSheetRepository) {}

  execute(projectId: number): Observable<TaskSheetEntity> {
    return this.repository.getSheet(projectId);
  }
}
