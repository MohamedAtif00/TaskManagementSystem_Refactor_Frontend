import { CurriculumNode } from '../../../curriculum-admin-screen/domain/entity/curriculum-admin.entity';

export interface SubjectFocusEntity {
  id: number;
  name: string;
  description?: string;
  status?: number;
  units: CurriculumNode[];
}
