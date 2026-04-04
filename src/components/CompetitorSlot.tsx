import { useDraggable, useDroppable } from '@dnd-kit/core';
import type { BracketSlot } from '../types';

interface Props {
  slot: BracketSlot;
  side: 'left' | 'right';
}

export default function CompetitorSlot({ slot, side }: Props) {
  const { competitor } = slot;

  const { attributes, listeners, setNodeRef: setDragRef, isDragging } = useDraggable({
    id: slot.slotId,
    disabled: !competitor, // can't drag a BYE
  });

  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: slot.slotId,
  });

  const isBye = !competitor;

  // Merge refs
  const setRef = (el: HTMLElement | null) => {
    setDragRef(el);
    setDropRef(el);
  };

  return (
    <div
      ref={setRef}
      {...attributes}
      {...listeners}
      className={`
        match-slot flex items-center gap-2 px-2 py-1 rounded
        border text-xs min-w-[140px] h-[36px] select-none
        transition-all duration-150
        ${isBye
          ? 'match-slot-bye border-slate-700 bg-slate-800/50 text-slate-500 italic'
          : 'border-slate-600 bg-slate-800 text-slate-100 cursor-grab active:cursor-grabbing'
        }
        ${isDragging ? 'dragging' : ''}
        ${isOver && !isDragging ? 'drop-target' : ''}
        ${side === 'right' ? 'flex-row-reverse text-right' : ''}
      `}
    >
      {competitor ? (
        <>
          {competitor.photoUrl && (
            <img
              src={competitor.photoUrl}
              alt={competitor.name}
              className="w-6 h-6 rounded-full object-cover flex-shrink-0"
            />
          )}
          <div className="flex flex-col leading-tight overflow-hidden">
            <span className="font-semibold truncate">{competitor.name}</span>
            <span className="text-[10px] text-slate-400 truncate">{competitor.school}</span>
          </div>
        </>
      ) : (
        <span className="w-full text-center">BYE</span>
      )}
    </div>
  );
}
