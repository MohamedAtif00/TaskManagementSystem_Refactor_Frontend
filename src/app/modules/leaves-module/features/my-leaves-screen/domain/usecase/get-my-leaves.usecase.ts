import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseUseCase } from '@core/base/usecase/base-usecase';
import { MyLeavesEntity } from '../entity/my-leaves.entity';
import { MyLeavesRepository } from '../repository/my-leaves.repository';

@Injectable()
export class GetMyLeavesUseCase implements BaseUseCase<number, MyLeavesEntity> {
  constructor(private repository: MyLeavesRepository) {}

  execute(userId: number): Observable<MyLeavesEntity> {
    return this.repository.getMine(userId);
  }
}
