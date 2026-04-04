import { useRef } from 'react';
import type { DivisionData } from '../types';

interface Props {
  onLoad: (divisions: DivisionData[]) => void;
  onShuffle: () => void;
  onBackgroundChange: (url: string | null) => void;
  onLogoChange: (url: string | null) => void;
  tournamentTitle: string;
  onTitleChange: (title: string) => void;
  hasBracket: boolean;
}

export default function Controls({
  onLoad, onShuffle, onBackgroundChange, onLogoChange,
  tournamentTitle, onTitleChange, hasBracket,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const bgRef = useRef<HTMLInputElement>(null);
  const logoRef = useRef<HTMLInputElement>(null);

  function handleJsonUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const raw = JSON.parse(reader.result as string);
        const divisions: DivisionData[] = Array.isArray(raw) ? raw : [raw];
        for (const d of divisions) {
          if (!d.division || !Array.isArray(d.competitors)) {
            alert('Invalid JSON format. Each division needs { division, competitors[] }');
            return;
          }
        }
        if (divisions.length === 0) {
          alert('No divisions found in the file.');
          return;
        }
        onLoad(divisions);
      } catch {
        alert('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  function handleImageUpload(
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (url: string | null) => void
  ) {
    const file = e.target.files?.[0];
    if (!file) return;
    setter(URL.createObjectURL(file));
    e.target.value = '';
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

      <input ref={fileRef} type="file" accept=".json" onChange={handleJsonUpload} className="hidden" />
      <button
        onClick={() => fileRef.current?.click()}
        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
      >
        Load JSON
      </button>

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

      <input ref={bgRef} type="file" accept="image/*" onChange={(e) => handleImageUpload(e, onBackgroundChange)} className="hidden" />
      <button
        onClick={() => bgRef.current?.click()}
        className="px-3 py-1.5 bg-slate-600 hover:bg-slate-700 text-white text-sm rounded transition-colors"
      >
        Background
      </button>

      <button
        onClick={() => { onBackgroundChange(null); onLogoChange(null); }}
        className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm rounded transition-colors"
      >
        Clear Images
      </button>

      <div className="ml-auto flex items-center gap-2">
        <span className="text-[10px] text-slate-500">Enable "Background graphics" in print dialog</span>
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
