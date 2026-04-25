import { useState, useEffect } from 'react';
import type { BracketState, DivisionData } from '../types';
import { generateBracket, reshuffleBracket } from '../bracketUtils';
import defaultAauLogo from '../../AAU_logo.png';
import Bracket from './Bracket';
import Controls from './Controls';

export default function App() {
  const [divisions, setDivisions] = useState<DivisionData[]>([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [bracket, setBracket] = useState<BracketState | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(defaultAauLogo);
  const [logoScale, setLogoScale] = useState(80);
  const [tournamentTitle, setTournamentTitle] = useState('2026 AAU NATIONAL QUALIFIER');
  const [layoutType, setLayoutType] = useState<'left-to-right' | 'symmetrical'>('symmetrical');

  // Per-division saved bracket states — persists edits when switching divisions
  const [savedBrackets, setSavedBrackets] = useState<Record<number, BracketState>>({});
  // Checklist: which divisions have been visited
  const [reviewed, setReviewed] = useState<Set<number>>(new Set());
  // When set, triggers print-all mode
  const [printAllBrackets, setPrintAllBrackets] = useState<BracketState[] | null>(null);

  function handleLoad(divs: DivisionData[]) {
    setDivisions(divs);
    setSelectedIdx(0);
    setReviewed(new Set([0]));
    const firstBracket = generateBracket(divs[0].division, divs[0].competitors);
    setBracket(firstBracket);
    setSavedBrackets({ 0: firstBracket });
  }

  function switchDivision(idx: number) {
    if (idx === selectedIdx || !divisions[idx]) return;
    // Save current bracket before leaving
    if (bracket) {
      setSavedBrackets(prev => ({ ...prev, [selectedIdx]: bracket }));
    }
    setSelectedIdx(idx);
    setReviewed(prev => new Set([...prev, idx]));
    // Restore saved state or generate fresh for first visit
    const saved = savedBrackets[idx];
    const div = divisions[idx];
    setBracket(saved ?? generateBracket(div.division, div.competitors));
  }

  function handleShuffle() {
    if (!bracket) return;
    setBracket(reshuffleBracket(bracket));
  }

  function handlePrintAll() {
    if (!divisions.length) return;
    // Merge live current bracket into savedBrackets before building the print set
    const merged = bracket ? { ...savedBrackets, [selectedIdx]: bracket } : savedBrackets;
    const all = divisions.map((div, i) =>
      merged[i] ?? generateBracket(div.division, div.competitors)
    );
    setPrintAllBrackets(all);
  }

  // After printAllBrackets renders into the DOM, open the print dialog
  useEffect(() => {
    if (!printAllBrackets) return;
    const timer = setTimeout(() => {
      window.print();
      setPrintAllBrackets(null);
    }, 150);
    return () => clearTimeout(timer);
  }, [printAllBrackets]);

  return (
    <div className="min-h-screen flex flex-col">
      <Controls
        onLoad={handleLoad}
        onShuffle={handleShuffle}
        onLogoChange={setLogoUrl}
        tournamentTitle={tournamentTitle}
        onTitleChange={setTournamentTitle}
        hasBracket={!!bracket}
        hasLogo={!!logoUrl}
        logoScale={logoScale}
        onLogoScaleChange={setLogoScale}
        layoutType={layoutType}
        onLayoutTypeChange={setLayoutType}
        onPrintAll={divisions.length > 1 ? handlePrintAll : undefined}
        reviewedCount={reviewed.size}
        totalDivisions={divisions.length}
      />

      {divisions.length > 1 && (
        <div className="no-print flex items-center gap-2 px-4 py-2 bg-slate-800 border-b border-slate-700">
          <label className="text-sm text-slate-400 mr-1">Division:</label>
          <button
            onClick={() => switchDivision(selectedIdx - 1)}
            disabled={selectedIdx === 0}
            className="px-2.5 py-1 bg-slate-600 hover:bg-slate-500 disabled:opacity-30 text-white text-base rounded transition-colors leading-none"
            title="Previous division"
          >
            ‹
          </button>
          <select
            value={selectedIdx}
            onChange={(e) => switchDivision(Number(e.target.value))}
            className="bg-slate-700 text-white text-sm rounded px-2 py-1 border border-slate-600 max-w-lg"
          >
            {divisions.map((d, i) => (
              <option key={i} value={i}>
                {reviewed.has(i) ? '✓' : '○'} {d.division} ({d.competitors.length})
              </option>
            ))}
          </select>
          <button
            onClick={() => switchDivision(selectedIdx + 1)}
            disabled={selectedIdx === divisions.length - 1}
            className="px-2.5 py-1 bg-slate-600 hover:bg-slate-500 disabled:opacity-30 text-white text-base rounded transition-colors leading-none"
            title="Next division"
          >
            ›
          </button>
          <span className="text-xs text-slate-400 ml-2">
            {reviewed.size}/{divisions.length} reviewed
          </span>
        </div>
      )}

      {/* Single bracket view — hidden during print-all */}
      {bracket ? (
        <div className={`flex-1 overflow-auto p-4 print:p-0 print:overflow-visible${printAllBrackets ? ' printing-all-hide' : ''}`}>
          <Bracket
            bracket={bracket}
            onBracketChange={setBracket}
            logoUrl={logoUrl}
            tournamentTitle={tournamentTitle}
            logoScale={logoScale}
            layoutType={layoutType}
          />
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-slate-500">
            <p className="text-xl mb-2">No bracket loaded</p>
            <p className="text-sm">Click "Load JSON" to import bracket data</p>
          </div>
        </div>
      )}

      {/* Print-all container: invisible on screen, one bracket per page when printing */}
      {printAllBrackets && (
        <div className="print-all-container">
          {printAllBrackets.map((b, i) => (
            <div key={i} className={i < printAllBrackets.length - 1 ? 'print-page-break' : ''}>
              <Bracket
                bracket={b}
                onBracketChange={() => {}}
                logoUrl={logoUrl}
                tournamentTitle={tournamentTitle}
                logoScale={logoScale}
                layoutType={layoutType}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
