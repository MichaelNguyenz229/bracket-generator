import type { Competitor, BracketSlot, SideRounds, BracketState } from './types';

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
 * Build the rounds structure for one side.
 * Only round 0 has competitors; later rounds are empty (TBD) slots.
 */
function buildSideRounds(firstRoundSlots: (Competitor | null)[]): SideRounds {
  const numRounds = Math.log2(firstRoundSlots.length);
  const rounds: SideRounds = [];

  // Round 0: initial matchups
  const r0: BracketSlot[][] = [];
  for (let i = 0; i < firstRoundSlots.length; i += 2) {
    r0.push([makeSlot(firstRoundSlots[i]), makeSlot(firstRoundSlots[i + 1])]);
  }
  rounds.push(r0);

  // Subsequent rounds: empty TBD slots
  for (let r = 1; r < numRounds; r++) {
    const numMatches = firstRoundSlots.length / Math.pow(2, r + 1);
    const round: BracketSlot[][] = [];
    for (let m = 0; m < numMatches; m++) {
      round.push([makeSlot(null), makeSlot(null)]);
    }
    rounds.push(round);
  }

  return rounds;
}

/**
 * Arrange competitors and byes into left/right side slot arrays.
 * Byes are spread evenly across both sides and always placed in
 * the second slot of a match so the competitor gets an auto-advance.
 */
function distributeCompetitors(
  competitors: Competitor[],
  bracketSize: number
): { leftSlots: (Competitor | null)[]; rightSlots: (Competitor | null)[] } {
  const half = bracketSize / 2;
  const shuffled = shuffle(competitors);
  const totalByes = bracketSize - competitors.length;

  // Distribute byes evenly: ceil to left, floor to right
  const leftByes = Math.ceil(totalByes / 2);
  const rightByes = Math.floor(totalByes / 2);

  const leftCompCount = half - leftByes;
  const rightCompCount = half - rightByes;

  const leftComps = shuffled.slice(0, leftCompCount);
  const rightComps = shuffled.slice(leftCompCount, leftCompCount + rightCompCount);

  const leftSlots = arrangeSide(leftComps, half);
  const rightSlots = arrangeSide(rightComps, half);

  return { leftSlots, rightSlots };
}

/**
 * Arrange competitors into `sideSize` slots.
 * Full matches (2 competitors) come first,
 * bye matches (competitor + null) come last.
 */
function arrangeSide(comps: Competitor[], sideSize: number): (Competitor | null)[] {
  const numMatches = sideSize / 2;
  const byeCount = sideSize - comps.length;
  const fullMatches = numMatches - byeCount;
  const slots: (Competitor | null)[] = [];
  let ci = 0;

  for (let m = 0; m < numMatches; m++) {
    if (m < fullMatches) {
      slots.push(comps[ci++]);
      slots.push(comps[ci++]);
    } else {
      slots.push(comps[ci++]);
      slots.push(null); // BYE
    }
  }

  return slots;
}

/** Generate a full bracket state from input data */
export function generateBracket(division: string, competitors: Competitor[]): BracketState {
  // 1 competitor: still generate a size-2 bracket (they face a BYE and win)
  const bracketSize = nextPowerOf2(Math.max(competitors.length, 2));

  slotCounter = 0;
  const { leftSlots, rightSlots } = distributeCompetitors(competitors, bracketSize);

  return {
    division,
    bracketSize,
    left: buildSideRounds(leftSlots),
    right: buildSideRounds(rightSlots),
  };
}

/** Re-shuffle and regenerate keeping same competitors */
export function reshuffleBracket(state: BracketState): BracketState {
  const competitors: Competitor[] = [];
  for (const side of [state.left, state.right]) {
    for (const match of side[0]) {
      for (const slot of match) {
        if (slot.competitor) competitors.push(slot.competitor);
      }
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

  for (const side of [newState.left, newState.right]) {
    for (const match of side[0]) {
      for (const slot of match) {
        if (slot.slotId === slotIdA) slotA = slot;
        if (slot.slotId === slotIdB) slotB = slot;
      }
    }
  }

  if (slotA && slotB) {
    const temp = slotA.competitor;
    slotA.competitor = slotB.competitor;
    slotB.competitor = temp;
  }

  return newState;
}
