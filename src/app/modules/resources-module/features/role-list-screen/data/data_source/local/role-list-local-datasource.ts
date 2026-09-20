import { Observable } from 'rxjs';
import { RoleFormPayload } from '../../../domain/entity/role-list.entity';
import { RoleModel, RolePermissionModel } from '../../model/role-list.model';

export abstract class RoleListLocalDataSource {
  abstract getRoles(): Observable<RoleModel[]>;
  abstract getPermissions(): Observable<RolePermissionModel[]>;
  abstract saveRole(payload: RoleFormPayload): Observable<RoleModel>;
  abstract deleteRole(id: number): Observable<void>;
}
