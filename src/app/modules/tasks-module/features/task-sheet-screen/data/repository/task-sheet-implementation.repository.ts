import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { TaskSheetEntity } from '../../domain/entity/task-sheet.entity';
import { TaskSheetRepository } from '../../domain/repository/task-sheet.repository';
import { TaskSheetLocalDataSource } from '../data_source/local/task-sheet-local-datasource';
import { TaskSheetRemoteDataSource } from '../data_source/remote/task-sheet-remote-datasource';
import { TaskSheetMapper } from '../model/task-sheet.model';

@Injectable()
export class TaskSheetImplementationRepository implements TaskSheetRepository {
  constructor(
    private local: TaskSheetLocalDataSource,
    private remote: TaskSheetRemoteDataSource,
  ) {}

  getSheet(projectId: number): Observable<TaskSheetEntity> {
    const source = environment.useMock ? this.local.getSheet(projectId) : this.remote.getSheet(projectId);
    return source.pipe(map((row) => TaskSheetMapper.toEntity(row)));
  }
}
