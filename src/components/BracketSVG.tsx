import { useDraggable, useDroppable } from '@dnd-kit/core';
import type { BracketSlot, Rounds } from '../types';

// ── Layout constants (easy to tune) ──
const SLOT_W_R0 = 250;    // width of outer name slots (expanded for long names)
const SLOT_W_INNER = 140; // width of internal slots
const SLOT_H = 38;        // height of each name slot
const MATCH_GAP = 6;      // vertical gap between two slots in a match
const MATCH_SPACING = 20; // vertical space between matches in round 0
const ROUND_GAP = 40;     // horizontal space for connector lines between rounds
const LINE_W = 1.5;       // stroke width
const LABEL_W = 14;       // width reserved for B/R label

// Derived
const MATCH_H = SLOT_H * 2 + MATCH_GAP;

interface Props {
  rounds: Rounds;
}

/**
 * Compute all positions and lines for a left-to-right bracket.
 * ALL lines (including slot underlines) are SVG so they share one coordinate system.
 */
function computeLayout(rounds: Rounds) {
  const numR0 = rounds[0].length;
  const totalHeight = numR0 * MATCH_H + (numR0 - 1) * MATCH_SPACING;

  const getSlotW = (r: number) => r === 0 ? SLOT_W_R0 : SLOT_W_INNER;
  const getColX = (r: number) => {
    if (r === 0) return 0;
    return SLOT_W_R0 + ROUND_GAP + (r - 1) * (SLOT_W_INNER + ROUND_GAP);
  };
  
  const totalWidth = getColX(rounds.length - 1) + getSlotW(rounds.length - 1) + ROUND_GAP;

  interface SlotPos {
    x: number;
    y: number;
    slot: BracketSlot;
    label: 'B' | 'R';
    roundIndex: number;
    w: number;
  }

  const slots: SlotPos[] = [];
  const lines: { x1: number; y1: number; x2: number; y2: number }[] = [];

  // Compute Y-center of each match per round
  const matchCenters: number[][] = [];

  // Round 0: evenly spaced
  const r0Centers: number[] = [];
  for (let m = 0; m < numR0; m++) {
    const top = m * (MATCH_H + MATCH_SPACING);
    r0Centers.push(top + MATCH_H / 2);
  }
  matchCenters.push(r0Centers);

  // Later rounds: midpoint between each pair
  for (let r = 1; r < rounds.length; r++) {
    const prev = matchCenters[r - 1];
    const centers: number[] = [];
    for (let m = 0; m < rounds[r].length; m++) {
      centers.push((prev[m * 2] + prev[m * 2 + 1]) / 2);
    }
    matchCenters.push(centers);
  }

  // Build slots and lines for each round
  for (let r = 0; r < rounds.length; r++) {
    const roundX = getColX(r);
    const slotW = getSlotW(r);

    for (let m = 0; m < rounds[r].length; m++) {
      const center = matchCenters[r][m];
      const matchTop = center - MATCH_H / 2;

      const topSlotY = matchTop;
      const bottomSlotY = matchTop + SLOT_H + MATCH_GAP;

      slots.push({ x: roundX, y: topSlotY, slot: rounds[r][m][0], label: 'B', roundIndex: r, w: slotW });
      slots.push({ x: roundX, y: bottomSlotY, slot: rounds[r][m][1], label: 'R', roundIndex: r, w: slotW });

      // Underline for each slot (drawn as SVG so it connects to everything else)
      const lineStartX = roundX + LABEL_W;  // after the B/R label
      const lineEndX = roundX + slotW;
      const topLineY = topSlotY + SLOT_H;
      const bottomLineY = bottomSlotY + SLOT_H;

      // Top slot underline
      lines.push({ x1: lineStartX, y1: topLineY, x2: lineEndX, y2: topLineY });
      // Bottom slot underline
      lines.push({ x1: lineStartX, y1: bottomLineY, x2: lineEndX, y2: bottomLineY });

      // Connector: horizontal from slot end to vertical bar
      const connectorX = lineEndX + ROUND_GAP / 2;

      // Horizontal from top slot to vertical bar
      lines.push({ x1: lineEndX, y1: topLineY, x2: connectorX, y2: topLineY });
      // Horizontal from bottom slot to vertical bar
      lines.push({ x1: lineEndX, y1: bottomLineY, x2: connectorX, y2: bottomLineY });
      // Vertical bar
      lines.push({ x1: connectorX, y1: topLineY, x2: connectorX, y2: bottomLineY });

      // Output line from midpoint to next round
      if (r < rounds.length - 1) {
        const midY = (topLineY + bottomLineY) / 2;
        
        const nextM = Math.floor(m / 2);
        const nextCenter = matchCenters[r + 1][nextM];
        const nextMatchTop = nextCenter - MATCH_H / 2;
        const targetY = (m % 2 === 0)
          ? nextMatchTop + SLOT_H
          : nextMatchTop + SLOT_H + MATCH_GAP + SLOT_H;

        const nextRoundStartX = getColX(r + 1);
        const verticalX = connectorX + 10;
        const nextLineStartX = nextRoundStartX + LABEL_W;

        // Horizontal from current bracket ] to vertical step
        lines.push({ x1: connectorX, y1: midY, x2: verticalX, y2: midY });
        
        // Vertical step connecting to target slot's Y level
        lines.push({ x1: verticalX, y1: midY, x2: verticalX, y2: targetY });

        // Horizontal from vertical step to next slot's underline
        lines.push({ x1: verticalX, y1: targetY, x2: nextLineStartX, y2: targetY });
      }
    }
  }

  // Final output line from the last match toward champion area
  const lastR = rounds.length - 1;
  const lastTop = matchCenters[lastR][0] - MATCH_H / 2;
  const finalTopY = lastTop + SLOT_H;
  const finalBottomY = lastTop + SLOT_H + MATCH_GAP + SLOT_H;
  const finalMidY = (finalTopY + finalBottomY) / 2;
  const finalSlotEnd = getColX(lastR) + getSlotW(lastR);
  const finalConnX = finalSlotEnd + ROUND_GAP / 2;
  lines.push({ x1: finalConnX, y1: finalMidY, x2: totalWidth, y2: finalMidY });

  return { slots, lines, totalWidth, totalHeight, finalMidY, finalMidX: 0 };
}

export default function BracketSVG({ rounds }: Props) {
  const { slots, lines, totalWidth, totalHeight } = computeLayout(rounds);

  return (
    <div className="relative" style={{ width: totalWidth, height: totalHeight }}>
      {/* SVG lines — ALL lines including slot underlines */}
      <svg
        className="absolute inset-0 pointer-events-none"
        width={totalWidth}
        height={totalHeight}
        style={{ overflow: 'visible' }}
      >
        {lines.map((l, i) => (
          <line
            key={i}
            x1={l.x1} y1={l.y1}
            x2={l.x2} y2={l.y2}
            stroke="#000"
            strokeWidth={LINE_W}
          />
        ))}
      </svg>

      {/* HTML slots (text + drag-and-drop only, no CSS underlines) */}
      {slots.map((s, i) => (
        <SlotElement
          key={`${s.slot.slotId}-${i}`}
          x={s.x}
          y={s.y}
          slot={s.slot}
          label={s.label}
          roundIndex={s.roundIndex}
          w={s.w}
        />
      ))}
    </div>
  );
}

export { computeLayout, MATCH_GAP, ROUND_GAP, MATCH_H, LABEL_W };

// ── Slot element with drag-and-drop ──

interface SlotProps {
  x: number;
  y: number;
  slot: BracketSlot;
  label: 'B' | 'R';
  roundIndex: number;
  w: number;
}

function SlotElement({ x, y, slot, label, roundIndex, w }: SlotProps) {
  const isFirstRound = roundIndex === 0;
  const { competitor } = slot;

  const { attributes, listeners, setNodeRef: setDragRef, isDragging } = useDraggable({
    id: slot.slotId,
    disabled: !competitor || !isFirstRound,
  });

  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: slot.slotId,
    disabled: !isFirstRound,
  });

  const setRef = (el: HTMLElement | null) => {
    setDragRef(el);
    setDropRef(el);
  };

  const isBye = !competitor;

  return (
    <div
      ref={setRef}
      {...attributes}
      {...listeners}
      className={`bracket-slot ${isDragging ? 'dragging' : ''} ${isOver && !isDragging ? 'drop-target' : ''} ${isBye && isFirstRound ? 'bye' : ''}`}
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: w,
        height: SLOT_H,
        cursor: isFirstRound && competitor ? 'grab' : 'default',
      }}
    >
      <span className="slot-label" style={{ width: LABEL_W }}>{label}</span>
      <div className="slot-content">
        {isFirstRound ? (
          competitor ? (
            <div className="slot-text">
              <div className="slot-name">{competitor.name}</div>
              {competitor.school && <div className="slot-school">{competitor.school}</div>}
            </div>
          ) : (
            <span className="slot-bye">BYE</span>
          )
        ) : null}
      </div>
    </div>
  );
}
