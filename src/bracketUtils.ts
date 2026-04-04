import type { Competitor, BracketSlot, Rounds, BracketState } from './types';

/** Smallest power of 2 >= n (minimum 2) */
export function nextPowerOf2(n: number): number {
  let p = 2;
  while (p < n) p *= 2;
  return p;
}

/** Fisher-Yates shuffle (returns new array) */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

let slotCounter = 0;
function makeSlot(competitor: Competitor | null): BracketSlot {
  return { slotId: `slot-${++slotCounter}`, competitor };
}

/**
 * Arrange competitors into bracket slots for round 0.
 * Full matches (2 competitors) come first, bye matches (competitor + null) come last.
 */
function arrangeFirstRound(competitors: Competitor[], bracketSize: number): BracketSlot[][] {
  const shuffled = shuffle(competitors);
  const numMatches = bracketSize / 2;
  const byeCount = bracketSize - competitors.length;
  const fullMatches = numMatches - byeCount;
  const matches: BracketSlot[][] = [];

  let ci = 0;
  for (let m = 0; m < numMatches; m++) {
    if (m < fullMatches) {
      matches.push([makeSlot(shuffled[ci++]), makeSlot(shuffled[ci++])]);
    } else {
      matches.push([makeSlot(shuffled[ci++]), makeSlot(null)]); // BYE
    }
  }

  return matches;
}

/** Generate a full bracket state from input data */
export function generateBracket(division: string, competitors: Competitor[]): BracketState {
  const bracketSize = nextPowerOf2(Math.max(competitors.length, 2));
  slotCounter = 0;

  const rounds: Rounds = [];
  const numRounds = Math.log2(bracketSize);

  // Round 0: initial matchups
  rounds.push(arrangeFirstRound(competitors, bracketSize));

  // Subsequent rounds: empty TBD slots
  for (let r = 1; r < numRounds; r++) {
    const numMatches = bracketSize / Math.pow(2, r + 1);
    const round: BracketSlot[][] = [];
    for (let m = 0; m < numMatches; m++) {
      round.push([makeSlot(null), makeSlot(null)]);
    }
    rounds.push(round);
  }

  return { division, bracketSize, rounds };
}

/** Re-shuffle and regenerate keeping same competitors */
export function reshuffleBracket(state: BracketState): BracketState {
  const competitors: Competitor[] = [];
  for (const match of state.rounds[0]) {
    for (const slot of match) {
      if (slot.competitor) competitors.push(slot.competitor);
    }
  }
  return generateBracket(state.division, competitors);
}

/**
 * Swap two competitor slots in the bracket (round 0 only).
 * Returns a new BracketState with the swap applied.
 */
export function swapSlots(
  state: BracketState,
  slotIdA: string,
  slotIdB: string
): BracketState {
  const newState: BracketState = JSON.parse(JSON.stringify(state));

  let slotA: BracketSlot | null = null;
  let slotB: BracketSlot | null = null;

  for (const match of newState.rounds[0]) {
    for (const slot of match) {
      if (slot.slotId === slotIdA) slotA = slot;
      if (slot.slotId === slotIdB) slotB = slot;
    }
  }

  if (slotA && slotB) {
    const temp = slotA.competitor;
    slotA.competitor = slotB.competitor;
    slotB.competitor = temp;
  }

  return newState;
}
