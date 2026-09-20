import { SignInEntity } from '../../domain/entity/sign-in.entity';
import { SignInModel } from '../model/sign-in.model';

export class SignInMapper {
  static toEntity(model: SignInModel): SignInEntity {
    return {
      id: model.id,
      name: model.name,
      code: model.code,
      role: model.role,
      group: model.group,
      token: model.token,
    };
  }
}
