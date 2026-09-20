import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CurriculumCatalogService } from '@core/network/curriculum-catalog.service';
import { TaskListParams } from '../../../domain/entity/task-list.entity';
import { TaskSubjectModel } from '../../model/task-list.model';
import { TaskListRemoteDataSource } from './task-list-remote-datasource';

@Injectable()
export class TaskListRemoteDataSourceImpl extends TaskListRemoteDataSource {
  constructor(private catalog: CurriculumCatalogService) {
    super();
  }

  getTasks(params: TaskListParams): Observable<TaskSubjectModel[]> {
    const search = params.search.trim().toLowerCase();
    return this.catalog.getTrees().pipe(
      map((trees) =>
        this.catalog
          .flattenSubjects(trees)
          .filter((row) => !params.year || row.year === params.year)
          .filter((row) => !params.term || row.term === params.term)
          .filter((row) => !search || `${row.name} ${row.folderPath}`.toLowerCase().includes(search)),
      ),
    );
  }
}
