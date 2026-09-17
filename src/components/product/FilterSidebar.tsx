import React from 'react';
import { FilterState } from '../../types/product';
import { RotateCcw, Check } from 'lucide-react';

interface FilterSidebarProps {
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  onResetFilters: () => void;
  totalMatches: number;
}

const CATEGORIES = [
  { id: 'ALL', label: 'All Caps' },
  { id: 'TECHNICAL', label: 'GORE-TEX® & Alpine' },
  { id: 'STRUCTURED', label: 'Monolith 6-Panel' },
  { id: 'CAMP_CAP', label: 'Cordura® 5-Panel Camp' },
  { id: 'RUNNER', label: 'Aerorunner Speed' },
];

const MATERIALS = [
  'GORE-TEX 3L',
  'CORDURA® 500D',
  'HEAVY TWILL',
  'RIPSTOP NYLON',
  'TECHNICAL SOFTSHELL',
];

const PROFILES = [
  '6-PANEL HIGH',
  '5-PANEL LOW',
  'UNSTRUCTURED RUNNER',
];

const COLORS = [
  { name: 'Onyx Black', hex: '#0A0A0A' },
  { name: 'Cement Slate', hex: '#71717A' },
  { name: 'Bone Off-White', hex: '#E4E4E7' },
  { name: 'Charcoal Stealth', hex: '#27272A' },
];

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  totalMatches,
}) => {
  const toggleMaterial = (mat: string) => {
    const exists = filters.materials.includes(mat);
    const updated = exists
      ? filters.materials.filter((m) => m !== mat)
      : [...filters.materials, mat];
    onFilterChange({ ...filters, materials: updated });
  };

  const toggleProfile = (prof: string) => {
    const exists = filters.profiles.includes(prof);
    const updated = exists
      ? filters.profiles.filter((p) => p !== prof)
      : [...filters.profiles, prof];
    onFilterChange({ ...filters, profiles: updated });
  };

  const toggleColor = (colName: string) => {
    const exists = filters.colors.includes(colName);
    const updated = exists
      ? filters.colors.filter((c) => c !== colName)
      : [...filters.colors, colName];
    onFilterChange({ ...filters, colors: updated });
  };

  const isFiltered =
    filters.category !== 'ALL' ||
    filters.materials.length > 0 ||
    filters.profiles.length > 0 ||
    filters.colors.length > 0 ||
    filters.inStockOnly;

  return (
    <aside className="w-full space-y-7 font-sans text-sm">
      
      {/* Header & Reset */}
      <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
        <div>
          <span className="text-xs text-neutral-500 uppercase font-semibold block">
            Filter Results
          </span>
          <span className="font-bold text-black text-sm">
            {totalMatches} {totalMatches === 1 ? 'Cap' : 'Caps'} Available
          </span>
        </div>
        {isFiltered && (
          <button
            onClick={onResetFilters}
            className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-600 hover:text-black underline transition-colors"
          >
            <RotateCcw size={12} />
            <span>Reset All</span>
          </button>
        )}
      </div>

      {/* 1. CATEGORY / DIVISION */}
      <div className="space-y-3">
        <h4 className="font-bold text-black uppercase tracking-wide text-xs">
          Headwear Category
        </h4>
        <div className="space-y-1">
          {CATEGORIES.map((cat) => {
            const isSelected = filters.category === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onFilterChange({ ...filters, category: cat.id })}
                className={`w-full text-left py-2 px-3 transition-all flex items-center justify-between text-sm rounded-sm ${
                  isSelected
                    ? 'bg-black text-white font-bold'
                    : 'bg-white text-neutral-700 hover:bg-neutral-100 hover:text-black font-medium'
                }`}
              >
                <span>{cat.label}</span>
                {isSelected && <span className="text-xs">✓</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. COLOR PALETTE */}
      <div className="space-y-3 pt-5 border-t border-neutral-200">
        <h4 className="font-bold text-black uppercase tracking-wide text-xs">
          Colorways
        </h4>
        <div className="grid grid-cols-2 gap-2">
          {COLORS.map((col) => {
            const isSelected = filters.colors.includes(col.name);
            return (
              <button
                key={col.name}
                onClick={() => toggleColor(col.name)}
                className={`flex items-center gap-2 p-2 border transition-all text-left rounded-sm ${
                  isSelected
                    ? 'border-black bg-neutral-100 font-bold text-black'
                    : 'border-neutral-200 text-neutral-600 hover:border-neutral-400'
                }`}
              >
                <span
                  className="w-4 h-4 rounded-full border border-neutral-300 flex-shrink-0 flex items-center justify-center"
                  style={{ backgroundColor: col.hex }}
                >
                  {isSelected && (
                    <Check
                      size={10}
                      className={col.hex === '#0A0A0A' || col.hex === '#27272A' ? 'text-white' : 'text-black'}
                    />
                  )}
                </span>
                <span className="text-xs truncate font-medium">{col.name.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. MATERIAL SPEC */}
      <div className="space-y-3 pt-5 border-t border-neutral-200">
        <h4 className="font-bold text-black uppercase tracking-wide text-xs">
          Textile Material
        </h4>
        <div className="space-y-2">
          {MATERIALS.map((mat) => {
            const isSelected = filters.materials.includes(mat);
            return (
              <label
                key={mat}
                onClick={() => toggleMaterial(mat)}
                className="flex items-center gap-3 text-neutral-700 hover:text-black cursor-pointer select-none text-xs font-medium"
              >
                <div
                  className={`w-4 h-4 border rounded-sm flex items-center justify-center transition-colors ${
                    isSelected ? 'bg-black border-black text-white' : 'border-neutral-300 bg-white'
                  }`}
                >
                  {isSelected && <Check size={11} />}
                </div>
                <span className={isSelected ? 'font-bold text-black' : ''}>
                  {mat}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* 4. SILHOUETTE PROFILE */}
      <div className="space-y-3 pt-5 border-t border-neutral-200">
        <h4 className="font-bold text-black uppercase tracking-wide text-xs">
          Silhouette Crown
        </h4>
        <div className="space-y-2">
          {PROFILES.map((prof) => {
            const isSelected = filters.profiles.includes(prof);
            return (
              <label
                key={prof}
                onClick={() => toggleProfile(prof)}
                className="flex items-center gap-3 text-neutral-700 hover:text-black cursor-pointer select-none text-xs font-medium"
              >
                <div
                  className={`w-4 h-4 border rounded-sm flex items-center justify-center transition-colors ${
                    isSelected ? 'bg-black border-black text-white' : 'border-neutral-300 bg-white'
                  }`}
                >
                  {isSelected && <Check size={11} />}
                </div>
                <span className={isSelected ? 'font-bold text-black' : ''}>
                  {prof}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* 5. IN STOCK TOGGLE */}
      <div className="pt-5 border-t border-neutral-200">
        <label className="flex items-center justify-between cursor-pointer select-none">
          <span className="text-xs font-bold text-black uppercase">
            In-Stock Only
          </span>
          <input
            type="checkbox"
            checked={filters.inStockOnly}
            onChange={(e) => onFilterChange({ ...filters, inStockOnly: e.target.checked })}
            className="w-4 h-4 accent-black border-neutral-300"
          />
        </label>
      </div>

    </aside>
  );
};
