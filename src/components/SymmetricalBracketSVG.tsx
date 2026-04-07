import { useDraggable, useDroppable } from '@dnd-kit/core';
import type { BracketSlot, Rounds } from '../types';

const SLOT_W_R0 = 250;
const SLOT_W_INNER = 140;
const SLOT_H = 38;
const MATCH_GAP = 80;     
const MATCH_SPACING = 120; 
const ROUND_GAP = 40;
const LINE_W = 1.5;
const LABEL_W = 14;

const MATCH_H = SLOT_H * 2 + MATCH_GAP;

interface Props {
  rounds: Rounds;
}

export function computeSymmetricalLayout(rounds: Rounds) {
  const R = rounds.length;
  if (R === 0) return { slots: [], lines: [], totalWidth: 0, totalHeight: 0, finalMidX: 0, finalMidY: 0 };

  const numR0 = rounds[0].length;
  const matchesPerSideR0 = Math.max(1, numR0 / R === 1 ? 1 : numR0 / 2); // if R=1 numR0=1
  const totalHeight = matchesPerSideR0 * MATCH_H + (matchesPerSideR0 - 1) * MATCH_SPACING;
  
  // Columns: 0..R-2 (Left), R-1 (Finals L), R (Center), R+1 (Finals R), R+2..2R (Right)
  const numCols = 2 * R + 1;
  const getSlotW = (col: number) => (col === 0 || col === numCols - 1) ? SLOT_W_R0 : SLOT_W_INNER;

  const colX: number[] = [0];
  for (let c = 1; c < numCols; c++) {
    colX.push(colX[c - 1] + getSlotW(c - 1) + ROUND_GAP);
  }
  const totalWidth = colX[numCols - 1] + getSlotW(numCols - 1);

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

  const matchCenters: number[][] = [];
  const r0Centers: number[] = [];
  for (let i = 0; i < matchesPerSideR0; i++) {
    const top = i * (MATCH_H + MATCH_SPACING);
    r0Centers.push(top + MATCH_H / 2);
  }
  matchCenters.push(r0Centers);

  for (let r = 1; r < R; r++) {
    const prev = matchCenters[r - 1];
    const centers: number[] = [];
    const len = Math.max(1, rounds[r].length / 2); 
    for (let i = 0; i < len; i++) {
      const idx1 = i * 2;
      const idx2 = i * 2 + 1;
      const val1 = prev[idx1] !== undefined ? prev[idx1] : prev[0];
      const val2 = prev[idx2] !== undefined ? prev[idx2] : val1;
      centers.push((val1 + val2) / 2);
    }
    matchCenters.push(centers);
  }

  let finalMidY = 0;
  let finalMidX = colX[R] + getSlotW(R) / 2;

  // Process all rounds EXCEPT Finals
  for (let r = 0; r < R - 1; r++) {
    for (let m = 0; m < rounds[r].length; m++) {
      const isLeft = m < rounds[r].length / 2;
      const col = isLeft ? r : 2 * R - r;
      const roundX = colX[col];
      const slotW = getSlotW(col);

      const i = isLeft ? m : m - rounds[r].length / 2;
      const center = matchCenters[r][i];
      const matchTop = center - MATCH_H / 2;

      const topSlotY = matchTop;
      const bottomSlotY = matchTop + SLOT_H + MATCH_GAP;

      slots.push({ x: roundX, y: topSlotY, slot: rounds[r][m][0], label: 'B', roundIndex: r, w: slotW });
      slots.push({ x: roundX, y: bottomSlotY, slot: rounds[r][m][1], label: 'R', roundIndex: r, w: slotW });

      const lineStartX = roundX + LABEL_W;
      const lineEndX = roundX + slotW;
      const topLineY = topSlotY + SLOT_H;
      const bottomLineY = bottomSlotY + SLOT_H;

      lines.push({ x1: lineStartX, y1: topLineY, x2: lineEndX, y2: topLineY });
      lines.push({ x1: lineStartX, y1: bottomLineY, x2: lineEndX, y2: bottomLineY });

      if (isLeft) {
        const connectorX = lineEndX + ROUND_GAP / 2;
        lines.push({ x1: lineEndX, y1: topLineY, x2: connectorX, y2: topLineY });
        lines.push({ x1: lineEndX, y1: bottomLineY, x2: connectorX, y2: bottomLineY });
        lines.push({ x1: connectorX, y1: topLineY, x2: connectorX, y2: bottomLineY });

        const midY = (topLineY + bottomLineY) / 2;
        
        const nextCol = r + 1;
        const nextRoundStartX = colX[nextCol];
        const verticalX = connectorX + 10;
        const nextLineStartX = nextRoundStartX + LABEL_W;

        let targetY;
        if (r === R - 2) {
          // Feeding directly into Split Finals
          targetY = matchCenters[R - 1][0]; // Center Y
        } else {
          const nextM = Math.floor(m / 2);
          const nextCenter = matchCenters[r + 1][nextM];
          const nextMatchTop = nextCenter - MATCH_H / 2;
          targetY = (m % 2 === 0) ? nextMatchTop + SLOT_H : nextMatchTop + SLOT_H + MATCH_GAP + SLOT_H;
        }

        lines.push({ x1: connectorX, y1: midY, x2: verticalX, y2: midY });
        lines.push({ x1: verticalX, y1: midY, x2: verticalX, y2: targetY });
        lines.push({ x1: verticalX, y1: targetY, x2: nextLineStartX, y2: targetY });
      } else {
        const connectorX = lineStartX - ROUND_GAP / 2;
        lines.push({ x1: lineStartX, y1: topLineY, x2: connectorX, y2: topLineY });
        lines.push({ x1: lineStartX, y1: bottomLineY, x2: connectorX, y2: bottomLineY });
        lines.push({ x1: connectorX, y1: topLineY, x2: connectorX, y2: bottomLineY });

        const midY = (topLineY + bottomLineY) / 2;

        const nextCol = 2 * R - (r + 1);
        const nextRoundStartX = colX[nextCol];
        const verticalX = connectorX - 10;
        const nextLineEndX = nextRoundStartX + getSlotW(nextCol);

        const iRight = m - rounds[r].length / 2;
        let targetY;
        if (r === R - 2) {
          // Feeding directly into Split Finals
          targetY = matchCenters[R - 1][0]; // Center Y
        } else {
          const nextI = Math.floor(iRight / 2);
          const nextCenter = matchCenters[r + 1][nextI];
          const nextMatchTop = nextCenter - MATCH_H / 2;
          targetY = (m % 2 === 0) ? nextMatchTop + SLOT_H : nextMatchTop + SLOT_H + MATCH_GAP + SLOT_H;
        }

        lines.push({ x1: connectorX, y1: midY, x2: verticalX, y2: midY });
        lines.push({ x1: verticalX, y1: midY, x2: verticalX, y2: targetY });
        lines.push({ x1: verticalX, y1: targetY, x2: nextLineEndX, y2: targetY });
      }
    }
  }

  // Process Finals separately
  if (R > 0) {
    const center = matchCenters[R - 1][0];
    finalMidY = center;
    const finalMatch = rounds[R - 1][0];

    const topY = center - SLOT_H;
    const lineY = center;

    // Finals Left
    const leftCol = R - 1;
    const leftX = colX[leftCol];
    const leftW = getSlotW(leftCol);
    slots.push({ x: leftX, y: topY, slot: finalMatch[0], label: 'B', roundIndex: R - 1, w: leftW });
    lines.push({ x1: leftX + LABEL_W, y1: lineY, x2: leftX + leftW, y2: lineY });
    lines.push({ x1: leftX + leftW, y1: lineY, x2: finalMidX - 82, y2: lineY });

    // Finals Right
    const rightCol = R + 1;
    const rightX = colX[rightCol];
    const rightW = getSlotW(rightCol);
    slots.push({ x: rightX, y: topY, slot: finalMatch[1], label: 'R', roundIndex: R - 1, w: rightW });
    lines.push({ x1: rightX + LABEL_W, y1: lineY, x2: rightX + rightW, y2: lineY });
    lines.push({ x1: rightX + LABEL_W, y1: lineY, x2: finalMidX + 82, y2: lineY });
  }

  return { slots, lines, totalWidth, totalHeight, finalMidY, finalMidX };
}

export default function SymmetricalBracketSVG({ rounds }: Props) {
  const { slots, lines, totalWidth, totalHeight } = computeSymmetricalLayout(rounds);

  return (
    <div className="relative" style={{ width: totalWidth, height: totalHeight }}>
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
