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

/** rounds[roundIndex][matchIndex], each match has exactly 2 slots */
export type Rounds = BracketSlot[][][];

export interface BracketState {
  division: string;
  bracketSize: number;       // total slots (power of 2)
  rounds: Rounds;            // single progression left → right
}

export interface DivisionData {
  division: string;
  competitors: Competitor[];
}

/** Input can be a single division object or an array of them */
export type InputData = DivisionData | DivisionData[];
