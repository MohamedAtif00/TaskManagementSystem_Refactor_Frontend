import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '@environments/environment';
import {
  ArchiveCurriculumPayload,
  CurriculumNode,
  CurriculumSchemaOption,
  CurriculumUserOption,
  SaveCurriculumPayload,
} from '../../domain/entity/curriculum-admin.entity';
import { CurriculumAdminRepository } from '../../domain/repository/curriculum-admin.repository';
import { CurriculumAdminLocalDataSource } from '../data_source/local/curriculum-admin-local-datasource';
import { CurriculumAdminRemoteDataSource } from '../data_source/remote/curriculum-admin-remote-datasource';
import { CurriculumAdminMapper } from '../model/curriculum-admin.model';

@Injectable()
export class CurriculumAdminImplementationRepository implements CurriculumAdminRepository {
  constructor(
    private local: CurriculumAdminLocalDataSource,
    private remote: CurriculumAdminRemoteDataSource,
  ) {}

  getTree(): Observable<CurriculumNode[]> {
    const source = environment.useMock ? this.local.getTree() : this.remote.getTree();
    return source.pipe(map((rows) => rows.map((row) => CurriculumAdminMapper.toNode(row))));
  }

  loadChildren(node: CurriculumNode): Observable<CurriculumNode[]> {
    const source = environment.useMock ? this.local.loadChildren(node) : this.remote.loadChildren(node);
    return source.pipe(map((rows) => rows.map((row) => CurriculumAdminMapper.toNode(row))));
  }

  save(payload: SaveCurriculumPayload): Observable<void> {
    return environment.useMock ? this.local.save(payload) : this.remote.save(payload);
  }

  archive(payload: ArchiveCurriculumPayload): Observable<void> {
    return environment.useMock ? this.local.archive(payload) : this.remote.archive(payload);
  }

  listSchemas(): Observable<CurriculumSchemaOption[]> {
    return environment.useMock ? this.local.listSchemas() : this.remote.listSchemas();
  }

  listUsers(): Observable<CurriculumUserOption[]> {
    return environment.useMock ? this.local.listUsers() : this.remote.listUsers();
  }

  getSubjectUsers(subjectId: number): Observable<number[]> {
    return environment.useMock ? this.local.getSubjectUsers(subjectId) : this.remote.getSubjectUsers(subjectId);
  }
}
