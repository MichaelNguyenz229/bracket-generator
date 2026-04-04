import { useRef } from 'react';
import type { DivisionData } from '../types';

interface Props {
  onLoad: (divisions: DivisionData[]) => void;
  onShuffle: () => void;
  onBackgroundChange: (url: string | null) => void;
  hasBracket: boolean;
}

export default function Controls({ onLoad, onShuffle, onBackgroundChange, hasBracket }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const bgRef = useRef<HTMLInputElement>(null);

  function handleJsonUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const raw = JSON.parse(reader.result as string);

        // Normalize: single division → array
        const divisions: DivisionData[] = Array.isArray(raw) ? raw : [raw];

        // Validate
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

  function handleBackgroundUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    onBackgroundChange(url);
    e.target.value = '';
  }

  function handlePrint() {
    window.print();
  }

  return (
    <div className="no-print flex flex-wrap items-center gap-3 p-4 bg-slate-900 border-b border-slate-700">
      <h1 className="text-lg font-bold text-white mr-4">Bracket Generator</h1>

      <input
        ref={fileRef}
        type="file"
        accept=".json"
        onChange={handleJsonUpload}
        className="hidden"
      />
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

      <input
        ref={bgRef}
        type="file"
        accept="image/*"
        onChange={handleBackgroundUpload}
        className="hidden"
      />
      <button
        onClick={() => bgRef.current?.click()}
        className="px-3 py-1.5 bg-slate-600 hover:bg-slate-700 text-white text-sm rounded transition-colors"
      >
        Background
      </button>

      <button
        onClick={() => onBackgroundChange(null)}
        className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm rounded transition-colors"
      >
        Clear BG
      </button>

      <button
        onClick={handlePrint}
        disabled={!hasBracket}
        className="px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:bg-slate-700 disabled:text-slate-500 text-white text-sm rounded transition-colors ml-auto"
      >
        Print
      </button>
    </div>
  );
}
