import { CurriculumNode, CurriculumSchemaOption, CurriculumUserOption } from '../../domain/entity/curriculum-admin.entity';

export type CurriculumNodeModel = CurriculumNode;
export type CurriculumSchemaModel = CurriculumSchemaOption;
export type CurriculumUserModel = CurriculumUserOption;

export class CurriculumAdminMapper {
  static toNode(model: CurriculumNodeModel): CurriculumNode {
    return {
      ...model,
      children: (model.children ?? []).map((child) => CurriculumAdminMapper.toNode(child)),
    };
  }
}
