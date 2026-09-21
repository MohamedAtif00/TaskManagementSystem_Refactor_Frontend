export interface TeamMember {
  id: number;
  name: string;
}

export interface TeamEntity {
  id: number;
  name: string;
  memberCount: number;
  members: TeamMember[];
}

export interface TeamMemberOption {
  id: number;
  name: string;
  teamId?: number | null;
}

export interface TeamFormPayload {
  id?: number;
  name: string;
  memberIds: number[];
}
