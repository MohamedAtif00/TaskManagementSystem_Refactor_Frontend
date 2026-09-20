import {
  SchemaEntity,
  SchemaNode,
  SchemaStep,
} from '../../domain/entity/schema-list.entity';

export type SchemaModel = SchemaEntity;
export type SchemaNodeModel = SchemaNode;
export type SchemaStepModel = SchemaStep;

export class SchemaListMapper {
  static toEntity(model: SchemaModel): SchemaEntity {
    return { ...model };
  }

  static toNode(model: SchemaNodeModel): SchemaNode {
    return { ...model, steps: model.steps.map((step) => ({ ...step })) };
  }
}
