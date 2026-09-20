import { DashboardEntity } from '../../domain/entity/dashboard.entity';
import { DashboardModel } from '../model/dashboard.model';

export class DashboardMapper {
  static toEntity(model: DashboardModel): DashboardEntity {
    return { ...model };
  }
}
