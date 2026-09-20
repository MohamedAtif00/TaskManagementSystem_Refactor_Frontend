import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseUseCase } from '@core/base/usecase/base-usecase';
import { UserListRepository } from '../repository/user-list.repository';

@Injectable()
export class ArchiveUserUseCase implements BaseUseCase<number, void> {
  constructor(private repository: UserListRepository) {}

  execute(id: number): Observable<void> {
    return this.repository.archiveUser(id);
  }
}
