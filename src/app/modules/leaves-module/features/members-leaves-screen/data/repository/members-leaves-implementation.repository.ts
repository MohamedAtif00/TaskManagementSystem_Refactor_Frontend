import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { MemberLeaveHistory, MemberLeaveRow } from '../../domain/entity/members-leaves.entity';
import { MembersLeavesRepository } from '../../domain/repository/members-leaves.repository';
import { MembersLeavesLocalDataSource } from '../data_source/local/members-leaves-local-datasource';
import { MembersLeavesRemoteDataSource } from '../data_source/remote/members-leaves-remote-datasource';
import { MembersLeavesMapper } from '../model/members-leaves.model';

@Injectable()
export class MembersLeavesImplementationRepository implements MembersLeavesRepository {
  constructor(
    private local: MembersLeavesLocalDataSource,
    private remote: MembersLeavesRemoteDataSource,
  ) {}

  getMembers(): Observable<MemberLeaveRow[]> {
    const source = environment.useMock ? this.local.getMembers() : this.remote.getMembers();
    return source.pipe(map((rows) => rows.map((row) => MembersLeavesMapper.toRow(row))));
  }

  getHistory(userId: number): Observable<MemberLeaveHistory> {
    const source = environment.useMock ? this.local.getHistory(userId) : this.remote.getHistory(userId);
    return source.pipe(map((row) => MembersLeavesMapper.toHistory(row)));
  }
}
