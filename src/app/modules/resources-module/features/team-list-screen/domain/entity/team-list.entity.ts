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

export interface TeamFormPayload {
  id?: number;
  name: string;
}
