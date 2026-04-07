import { useRef } from 'react';
import type { DivisionData } from '../types';

interface Props {
  onLoad: (divisions: DivisionData[]) => void;
  onShuffle: () => void;
  onLogoChange: (url: string | null) => void;
  tournamentTitle: string;
  onTitleChange: (title: string) => void;
  hasBracket: boolean;
  hasLogo: boolean;
  logoScale: number;
  onLogoScaleChange: (scale: number) => void;
  layoutType: 'left-to-right' | 'symmetrical';
  onLayoutTypeChange: (type: 'left-to-right' | 'symmetrical') => void;
}

export default function Controls({
  onLoad, onShuffle, onLogoChange,
  tournamentTitle, onTitleChange, hasBracket,
  hasLogo, logoScale, onLogoScaleChange,
  layoutType, onLayoutTypeChange
}: Props) {
  const logoRef = useRef<HTMLInputElement>(null);

  function handleImageUpload(
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (url: string | null) => void
  ) {
    const file = e.target.files?.[0];
    if (!file) return;
    setter(URL.createObjectURL(file));
    e.target.value = '';
  }

  function handlePipelineLoad() {
    fetch('/pipeline_data.json')
      .then(res => res.json())
      .then(raw => {
        const divisions: DivisionData[] = Array.isArray(raw) ? raw : [raw];
        for (const d of divisions) {
          if (!d.division || !Array.isArray(d.competitors)) {
            alert('Invalid JSON format in pipeline data.');
            return;
          }
        }
        if (divisions.length === 0) {
          alert('No divisions found in pipeline data.');
          return;
        }
        onLoad(divisions);
      })
      .catch(() => {
        alert('Could not find pipeline data. Did you click "Sync directly to Bracket Generator" in the Python app first?');
      });
  }

  return (
    <div className="no-print flex flex-wrap items-center gap-3 p-3 bg-slate-900 border-b border-slate-700">
      <h1 className="text-lg font-bold text-white mr-2">Bracket Generator</h1>

      {/* Title input */}
      <input
        type="text"
        value={tournamentTitle}
        onChange={(e) => onTitleChange(e.target.value)}
        placeholder="Tournament Title"
        className="bg-slate-700 text-white text-sm rounded px-2 py-1 border border-slate-600 w-64"
      />

      <div className="flex gap-1 pr-3 mr-1">
        <button
          onClick={handlePipelineLoad}
          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-1 text-sm rounded transition-colors shadow-sm"
          title="Pull data directly from the Python Pipeline"
        >
          ⚡ Auto-Load
        </button>
      </div>

      <button
        onClick={onShuffle}
        disabled={!hasBracket}
        className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 disabled:bg-slate-700 disabled:text-slate-500 text-white text-sm rounded transition-colors"
      >
        Shuffle
      </button>

      <input ref={logoRef} type="file" accept="image/*" onChange={(e) => handleImageUpload(e, onLogoChange)} className="hidden" />
      <button
        onClick={() => logoRef.current?.click()}
        className="px-3 py-1.5 bg-slate-600 hover:bg-slate-700 text-white text-sm rounded transition-colors"
      >
        Logo
      </button>

      {hasLogo && (
        <div className="flex items-center gap-3 bg-slate-800 px-3 py-1.5 rounded border border-slate-700">
          <label className="text-slate-300 text-xs flex items-center gap-2">
            Logo Size:
            <input type="range" min="20" max="250" value={logoScale} onChange={(e) => onLogoScaleChange(Number(e.target.value))} className="w-20 accent-slate-400" />
          </label>
        </div>
      )}

      <button
        onClick={() => { onLogoChange(null); }}
        className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm rounded transition-colors"
      >
        Clear Logo
      </button>

      <div className="ml-auto flex items-center gap-3">
        <select
          value={layoutType}
          onChange={(e) => onLayoutTypeChange(e.target.value as 'left-to-right' | 'symmetrical')}
          className="bg-slate-700 text-white text-sm rounded px-2 py-1.5 border border-slate-600 outline-none hover:border-slate-500 cursor-pointer"
        >
          <option value="symmetrical">Symmetrical Layout</option>
          <option value="left-to-right">Left-to-Right Layout</option>
        </select>
        <button
          onClick={() => window.print()}
          disabled={!hasBracket}
          className="px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:bg-slate-700 disabled:text-slate-500 text-white text-sm rounded transition-colors"
        >
          Print
        </button>
      </div>
    </div>
  );
}
