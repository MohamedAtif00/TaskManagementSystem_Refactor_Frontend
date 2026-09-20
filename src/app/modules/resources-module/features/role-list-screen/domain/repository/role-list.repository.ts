import { Observable } from 'rxjs';
import { RoleEntity, RoleFormPayload, RolePermissionOption } from '../entity/role-list.entity';

export abstract class RoleListRepository {
  abstract getRoles(): Observable<RoleEntity[]>;
  abstract getPermissions(): Observable<RolePermissionOption[]>;
  abstract saveRole(payload: RoleFormPayload): Observable<RoleEntity>;
  abstract deleteRole(id: number): Observable<void>;
}
