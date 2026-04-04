export interface Competitor {
  id: string;
  name: string;
  school: string;
  photoUrl: string;
}

export interface BracketSlot {
  slotId: string;
  competitor: Competitor | null; // null = BYE
}

/** matches[roundIndex][matchIndex], each match has exactly 2 slots */
export type SideRounds = BracketSlot[][][];

export interface BracketState {
  division: string;
  bracketSize: number;       // total slots (power of 2)
  left: SideRounds;          // left side rounds
  right: SideRounds;         // right side rounds
}

export interface DivisionData {
  division: string;
  competitors: Competitor[];
}

/** Input can be a single division object or an array of them */
export type InputData = DivisionData | DivisionData[];
