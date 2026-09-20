export const STEP_PRIORITY_LABELS: Record<number, string> = {
  0: 'None',
  1: 'High',
  2: 'Medium',
  3: 'Low',
};

export interface SchemaTypeOption {
  id: number;
  name: string;
}

export interface SchemaTaskBankOption {
  id: number;
  name: string;
}

export interface SchemaEntity {
  id: number;
  name: string;
  description: string;
  typeId?: number | null;
  typeName: string;
}

export interface SchemaFormPayload {
  id?: number;
  name: string;
  description: string;
  typeId?: number | null;
}

export interface SchemaStep {
  id: number;
  order: number;
  duration: number;
  priority: number;
  nodeId: number;
  taskBankId: number;
  taskBankName: string;
}

export interface SchemaNode {
  id: number;
  name: string;
  order: number;
  isStart: boolean;
  isEnd: boolean;
  schemaId: number;
  steps: SchemaStep[];
}

export interface NodeFormPayload {
  id?: number;
  schemaId: number;
  name: string;
  isStart: boolean;
  isEnd: boolean;
}

export interface StepFormPayload {
  id?: number;
  nodeId: number;
  taskBankId: number;
  duration: number;
  priority: number;
}
