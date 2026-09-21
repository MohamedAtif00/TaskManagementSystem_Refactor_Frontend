export interface BalancesDto {
  annualLeave: number;
  annualLeaveMax: number;
  emergencyLeave: number;
  emergencyLeaveMax: number;
  sickLeave: number;
  fromNextBalanceDaysUsed?: number;
  fromNextBalanceMaxDays?: number;
  permission: number;
  permissionMax: number;
  workFromHome: number;
  workFromHomeMax: number;
}

export function mapBalances(dto: BalancesDto) {
  return {
    annualUsed: dto.annualLeave,
    annualMax: dto.annualLeaveMax,
    sickUsed: dto.sickLeave,
    emergencyUsed: dto.emergencyLeave,
    emergencyMax: dto.emergencyLeaveMax,
    permissionUsed: dto.permission,
    permissionMax: dto.permissionMax,
    wfhUsed: dto.workFromHome,
    wfhMax: dto.workFromHomeMax,
    fromNextUsed: dto.fromNextBalanceDaysUsed ?? 0,
    fromNextMax: dto.fromNextBalanceMaxDays ?? 0,
  };
}

export function hoursBetween(fromTime: string, toTime: string): number {
  const [fromH, fromM] = fromTime.split(':').map(Number);
  const [toH, toM] = toTime.split(':').map(Number);
  return Math.max(0, Math.round((toH + toM / 60 - (fromH + fromM / 60)) * 10) / 10);
}

export function lastComment(opinions?: { comment?: string }[]): string | undefined {
  const comments = (opinions ?? []).map((row) => row.comment).filter(Boolean);
  return comments.at(-1);
}
