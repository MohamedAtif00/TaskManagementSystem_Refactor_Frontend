export interface SectionTeamOption {
  id: number;
  name: string;
}

export interface SectionHeadOption {
  id: number;
  name: string;
}

export interface SectionEntity {
  id: number;
  name: string;
  headId: number;
  headName: string;
  teams: SectionTeamOption[];
}

export interface SectionFormPayload {
  id?: number;
  name: string;
  headId: number;
  teamIds: number[];
}

export interface SectionFormOptions {
  heads: SectionHeadOption[];
  teams: SectionTeamOption[];
}
