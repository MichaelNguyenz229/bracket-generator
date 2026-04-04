import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { BracketState } from '../types';
import { swapSlots } from '../bracketUtils';
import BracketSide from './BracketSide';

interface Props {
  bracket: BracketState;
  onBracketChange: (b: BracketState) => void;
  backgroundUrl: string | null;
}

export default function Bracket({ bracket, onBracketChange, backgroundUrl }: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const updated = swapSlots(
      bracket,
      String(active.id),
      String(over.id)
    );
    onBracketChange(updated);
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="bracket-container relative w-full overflow-auto">
        {/* Background image */}
        {backgroundUrl && (
          <div
            className="bg-overlay absolute inset-0 bg-cover bg-center opacity-10 pointer-events-none"
            style={{ backgroundImage: `url(${backgroundUrl})` }}
          />
        )}

        {/* Division title */}
        <h2 className="division-title text-center text-2xl font-bold py-4 relative z-10">
          {bracket.division}
        </h2>

        {/* Bracket body */}
        <div className="flex items-center justify-center gap-8 px-4 pb-6 relative z-10 min-h-[400px]">
          {/* Left side */}
          <BracketSide rounds={bracket.left} side="left" />

          {/* Champion slot */}
          <div className="flex flex-col items-center gap-2 flex-shrink-0">
            <div className="text-xs text-slate-400 uppercase tracking-wider">Champion</div>
            <div className="border-2 border-yellow-500 bg-slate-800 rounded-lg px-4 py-3 min-w-[160px] text-center">
              <span className="text-slate-500 italic text-sm">TBD</span>
            </div>
          </div>

          {/* Right side */}
          <BracketSide rounds={bracket.right} side="right" />
        </div>
      </div>
    </DndContext>
  );
}
