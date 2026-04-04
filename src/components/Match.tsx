import type { BracketSlot } from '../types';
import CompetitorSlot from './CompetitorSlot';

interface Props {
  slots: BracketSlot[];
  side: 'left' | 'right';
  roundIndex: number;
}

export default function Match({ slots, side, roundIndex }: Props) {
  const isFirstRound = roundIndex === 0;

  return (
    <div className="flex flex-col gap-[2px]">
      {isFirstRound ? (
        <>
          <CompetitorSlot slot={slots[0]} side={side} />
          <CompetitorSlot slot={slots[1]} side={side} />
        </>
      ) : (
        <>
          <EmptySlot side={side} />
          <EmptySlot side={side} />
        </>
      )}
    </div>
  );
}

function EmptySlot({ side }: { side: 'left' | 'right' }) {
  return (
    <div
      className={`
        match-slot flex items-center px-2 py-1 rounded
        border border-dashed border-slate-700 bg-slate-900/50
        text-xs min-w-[140px] h-[36px] text-slate-600 italic
        ${side === 'right' ? 'text-right justify-end' : ''}
      `}
    >
      TBD
    </div>
  );
}
