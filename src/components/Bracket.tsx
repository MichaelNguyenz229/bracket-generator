import { useMemo } from 'react';
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { BracketState } from '../types';
import { swapSlots } from '../bracketUtils';
import BracketSVG, { computeLayout } from './BracketSVG';

interface Props {
  bracket: BracketState;
  onBracketChange: (b: BracketState) => void;
  backgroundUrl: string | null;
  logoUrl: string | null;
  tournamentTitle: string;
}

// Landscape US Letter printable area at 96 DPI (11" x 8.5" minus 0.3" margins)
const PAGE_W = 10.4 * 96;  // ~998px
const PAGE_H = 7.9 * 96;   // ~758px

export default function Bracket({ bracket, onBracketChange, backgroundUrl, logoUrl, tournamentTitle }: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    onBracketChange(swapSlots(bracket, String(active.id), String(over.id)));
  }

  const layout = computeLayout(bracket.rounds);

  // Estimate total content height: header (~140px) + bracket + 1st place box offset + placement footer (~100px) + padding (~60px)
  const headerEstimate = logoUrl ? 160 : 100;
  const footerEstimate = 120;
  const paddingEstimate = 60;
  const contentH = headerEstimate + layout.totalHeight + footerEstimate + paddingEstimate;
  const contentW = layout.totalWidth + 200; // bracket + 1st place box + padding

  const printScale = useMemo(() => {
    const scaleY = PAGE_H / contentH;
    const scaleX = PAGE_W / contentW;
    return Math.min(scaleX, scaleY, 1);
  }, [contentH, contentW]);

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div
        className="bracket-page relative overflow-auto flex flex-col"
        style={{
          border: '2px solid #000',
          minHeight: '100vh',
          // CSS custom property for print scaling
          '--print-scale': printScale,
        } as React.CSSProperties}
      >
        {/* Background image overlay */}
        {backgroundUrl && (
          <div
            className="bg-overlay absolute inset-0 bg-cover bg-center opacity-10 pointer-events-none"
            style={{ backgroundImage: `url(${backgroundUrl})` }}
          />
        )}

        <div className="relative z-10 flex flex-col flex-1 bracket-content">
          {/* Header: Title + Logo */}
          <div className="text-center pt-4 pb-2">
            <h1 className="text-3xl font-black tracking-wide uppercase">
              {tournamentTitle}
            </h1>
            {logoUrl && (
              <div className="flex justify-center mt-2">
                <img src={logoUrl} alt="Tournament Logo" className="h-20 object-contain" />
              </div>
            )}
          </div>

          {/* Division + Ring */}
          <div className="text-center pb-4">
            <div className="text-base font-bold">{bracket.division}</div>
            <div className="flex items-baseline justify-center gap-2 mt-1">
              <span className="text-sm font-bold">RING:</span>
              <span style={{ borderBottom: '1.5px solid #000', width: 180, display: 'inline-block' }}>&nbsp;</span>
            </div>
          </div>

          {/* Bracket + Champion — centered horizontally and vertically in remaining space */}
          <div className="flex-1 flex items-center justify-center px-6">
            <div className="flex items-start">
              {/* SVG bracket */}
              <BracketSVG rounds={bracket.rounds} />

              {/* 1ST PLACE box — aligned with final output line */}
              <div
                className="flex-shrink-0 pl-1"
                style={{ marginTop: layout.finalMidY - 30 }}
              >
                <div
                  className="flex flex-col items-center"
                  style={{
                    border: '2px solid #000',
                    minWidth: 160,
                    padding: '8px 16px',
                  }}
                >
                  <div className="font-bold text-sm mb-2">1ST PLACE</div>
                  <div style={{ borderBottom: '1.5px solid #000', width: '100%', minHeight: 18 }} />
                </div>
              </div>
            </div>
          </div>

          {/* Placement lines — bottom right */}
          <div className="flex justify-end px-8 pb-6">
            <div className="flex flex-col gap-3" style={{ minWidth: 260 }}>
              <div className="placement-line">
                <span>2ND</span>
                <div className="line" />
              </div>
              <div className="placement-line">
                <span>3RD</span>
                <div className="line" />
              </div>
              <div className="placement-line">
                <span>4TH</span>
                <div className="line" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </DndContext>
  );
}
