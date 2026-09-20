export const TASK_BANK_TYPE_LABELS: Record<number, string> = {
  0: 'Creation',
  1: 'Review',
};

export interface TaskBankTeamOption {
  id: number;
  name: string;
}

export interface TaskBankItem {
  id: number;
  name: string;
  duration: number;
  type: number;
  teamLeaderOnly: boolean;
  teamId: number;
  teamName: string;
}

export interface TaskBankFormPayload {
  id?: number;
  name: string;
  duration: number;
  type: number;
  teamLeaderOnly: boolean;
  teamId: number;
}
