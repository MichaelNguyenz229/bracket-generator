import { useState } from 'react';
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

  function handleLoad(divs: DivisionData[]) {
    setDivisions(divs);
    setSelectedIdx(0);
    const first = divs[0];
    setBracket(generateBracket(first.division, first.competitors));
  }

  function handleDivisionChange(idx: number) {
    setSelectedIdx(idx);
    const div = divisions[idx];
    setBracket(generateBracket(div.division, div.competitors));
  }

  function handleShuffle() {
    if (!bracket) return;
    setBracket(reshuffleBracket(bracket));
  }

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
      />

      {divisions.length > 1 && (
        <div className="no-print flex items-center gap-3 px-4 py-2 bg-slate-800 border-b border-slate-700">
          <label className="text-sm text-slate-400">Division:</label>
          <select
            value={selectedIdx}
            onChange={(e) => handleDivisionChange(Number(e.target.value))}
            className="bg-slate-700 text-white text-sm rounded px-2 py-1 border border-slate-600 max-w-lg"
          >
            {divisions.map((d, i) => (
              <option key={i} value={i}>
                {d.division} ({d.competitors.length})
              </option>
            ))}
          </select>
        </div>
      )}

      {bracket ? (
        <div className="flex-1 overflow-auto p-4 print:p-0 print:overflow-visible">
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
    </div>
  );
}
