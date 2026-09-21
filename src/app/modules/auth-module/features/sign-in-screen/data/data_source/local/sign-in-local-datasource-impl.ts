import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import {
  APPROVER_PERMISSIONS,
  MEMBER_PERMISSIONS,
  OWNER_PERMISSIONS,
  PROJECT_MANAGER_PERMISSIONS,
} from '@core/models/permission-codes';
import { UserRole } from '@core/models/user-role';
import { SignInModel } from '../../model/sign-in.model';
import { SignInLocalDataSource } from './sign-in-local-datasource';

@Injectable()
export class SignInLocalDataSourceImpl extends SignInLocalDataSource {
  private readonly users: SignInModel[] = [
    {
      id: 1,
      name: 'Omar Owner',
      code: 'OWN001',
      role: UserRole.Owner,
      group: 'Leadership',
      token: 'fake.jwt.own001',
      permissions: OWNER_PERMISSIONS,
      notifications: 2,
    },
    {
      id: 2,
      name: 'Paula Manager',
      code: 'PM001',
      role: UserRole.ProjectManager,
      group: 'PMO',
      token: 'fake.jwt.pm001',
      permissions: PROJECT_MANAGER_PERMISSIONS,
      notifications: 0,
    },
    {
      id: 3,
      name: 'Tarek Leader',
      code: 'TL001',
      role: UserRole.TeamLeader,
      group: 'Math Team',
      token: 'fake.jwt.tl001',
      permissions: APPROVER_PERMISSIONS,
      notifications: 1,
    },
    {
      id: 4,
      name: 'Sara Head',
      code: 'SH001',
      role: UserRole.SectionHead,
      group: 'Science Section',
      token: 'fake.jwt.sh001',
      permissions: APPROVER_PERMISSIONS,
      notifications: 0,
    },
    {
      id: 5,
      name: 'Mona Member',
      code: 'MEM001',
      role: UserRole.Member,
      group: 'Math Team',
      token: 'fake.jwt.mem001',
      permissions: MEMBER_PERMISSIONS,
      notifications: 0,
    },
  ];

  signIn(code: string): Observable<SignInModel> {
    const user = this.users.find((item) => item.code === code);
    if (!user) {
      return throwError(() => new Error('Invalid employee code'));
    }
    return of({ ...user, permissions: [...user.permissions] }).pipe(delay(250));
  }
}
