export interface TeamMember {
  id: number;
  name: string;
}

export interface TeamEntity {
  id: number;
  name: string;
  memberCount: number;
  members: TeamMember[];
  teamleaderId?: number | null;
  teamleaderName?: string | null;
}

export interface TeamMemberOption {
  id: number;
  name: string;
  teamId?: number | null;
}

export interface TeamLeaderOption {
  id: number;
  name: string;
}

export interface TeamFormPayload {
  id?: number;
  name: string;
  memberIds: number[];
  teamleaderId?: number | null;
}
