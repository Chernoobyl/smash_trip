import React, { useState } from 'react';
import { SPRITE_MANIFEST, SpriteId, INITIAL_VALIDATION_SPRITES } from '../assets';
import { SpriteImage, getSpriteStatus, clearAssetCache } from '../services/spriteAssets';
import { ArrowLeft, RefreshCw, Layers, Sparkles, Search } from 'lucide-react';
import { audioManager } from '../services/audio';

interface AssetDebugScreenProps {
  onBack: () => void;
}

export const AssetDebugScreen: React.FC<AssetDebugScreenProps> = ({ onBack }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('validation8');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [, setTick] = useState(0);

  const allSprites = Object.values(SPRITE_MANIFEST);

  const categories = [
    { id: 'validation8', label: '⭐ VALIDAÇÃO 8 (INICIAL)' },
    { id: 'all', label: 'TODOS (TOTAL: ' + allSprites.length + ')' },
    { id: 'logo', label: 'LOGO' },
    { id: 'brutus', label: 'BRUTUS' },
    { id: 'nika', label: 'NIKA' },
    { id: 'volt', label: 'VOLT' },
    { id: 'dummy', label: 'DUMMY JACK' },
    { id: 'weapons', label: 'ARMAS & EQUIP' },
    { id: 'boosters', label: 'BOOSTERS' },
    { id: 'fx', label: 'COMIC FX' },
    { id: 'collectibles', label: 'COLETÁVEIS' },
    { id: 'backgrounds', label: 'BACKGROUNDS' },
    { id: 'environment', label: 'AMBIENTE / ENV' },
  ];

  const filteredSprites = allSprites.filter((s) => {
    let matchesCat = false;
    if (selectedCategory === 'validation8') {
      matchesCat = INITIAL_VALIDATION_SPRITES.includes(s.id);
    } else if (selectedCategory === 'all') {
      matchesCat = true;
    } else {
      matchesCat = s.category === selectedCategory;
    }

    const matchesSearch =
      s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.filePath.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleRefresh = () => {
    audioManager.playClick();
    clearAssetCache();
    setTick((t) => t + 1);
  };

  const readyCount = allSprites.filter((s) => getSpriteStatus(s.id) === 'READY').length;
  const missingCount = allSprites.filter((s) => getSpriteStatus(s.id) === 'MISSING').length;
  const validationReadyCount = INITIAL_VALIDATION_SPRITES.filter(
    (id) => getSpriteStatus(id) === 'READY'
  ).length;

  return (
    <div className="relative w-full h-full flex flex-col justify-between p-3 sm:p-6 overflow-hidden select-none bg-slate-950 text-slate-100">
      {/* Top Header */}
      <div className="flex items-center justify-between w-full max-w-6xl mx-auto mb-2">
        <button
          onClick={() => {
            audioManager.playClick();
            onBack();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 text-sm font-bold text-slate-300 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> VOLTAR
        </button>

        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-amber-400" />
          <span className="font-['Titan_One'] text-lg sm:text-xl text-amber-400 tracking-wide">
            SPRITES MANIFEST (1 PNG = 1 SPRITE)
          </span>
        </div>

        <button
          onClick={handleRefresh}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
          title="Limpar Cache de Imagens"
        >
          <RefreshCw className="w-3.5 h-3.5" /> REFRESH
        </button>
      </div>

      {/* Info Status Banner */}
      <div className="w-full max-w-6xl mx-auto mb-2 p-2.5 bg-slate-900/90 border border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-sky-400 shrink-0" />
          <span>
            Validação 1:1 sem corte. Validação inicial dos 8 Sprites: <strong className="text-amber-300 font-mono">{validationReadyCount} / 8 READY</strong>
          </span>
        </div>
        <div className="flex items-center gap-3 font-mono text-[11px]">
          <span className="text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
            READY: {readyCount}
          </span>
          <span className="text-red-400 font-bold bg-red-950/60 px-2 py-0.5 rounded border border-red-500/30">
            MISSING: {missingCount}
          </span>
          <span className="text-slate-400">
            TOTAL: {allSprites.length}
          </span>
        </div>
      </div>

      {/* Category Tabs & Search Bar */}
      <div className="w-full max-w-6xl mx-auto flex flex-col sm:flex-row gap-2 items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                audioManager.playClick();
                setSelectedCategory(cat.id);
              }}
              className={`px-3 py-1.5 rounded-xl font-['Titan_One'] text-[11px] whitespace-nowrap transition cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64 shrink-0">
          <Search className="w-4 h-4 absolute left-3 top-2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar SpriteId..."
            className="w-full pl-9 pr-3 py-1 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
          />
        </div>
      </div>

      {/* Sprites Grid */}
      <div className="w-full max-w-6xl mx-auto flex-1 overflow-y-auto pr-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 pb-4">
          {filteredSprites.map((sprite) => {
            const status = getSpriteStatus(sprite.id);
            const isReady = status === 'READY';

            return (
              <div
                key={sprite.id}
                className={`flex flex-col justify-between p-2.5 bg-slate-900/80 border rounded-2xl transition ${
                  INITIAL_VALIDATION_SPRITES.includes(sprite.id)
                    ? 'border-amber-500/50 bg-slate-900/95'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Header with SpriteId & Status Badge */}
                <div className="flex items-start justify-between gap-1.5 mb-1.5">
                  <div className="flex flex-col min-w-0">
                    <span className="font-mono text-[11px] font-black text-amber-300 truncate" title={sprite.id}>
                      {sprite.id}
                    </span>
                    <span className="text-[10px] text-slate-400 truncate">
                      {sprite.name}
                    </span>
                  </div>
                  <span
                    className={`px-1.5 py-0.5 rounded font-mono text-[9px] font-black uppercase shrink-0 ${
                      isReady
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'bg-red-500/20 text-red-400 border border-red-500/40'
                    }`}
                  >
                    {status}
                  </span>
                </div>

                {/* Live Preview Box */}
                <div className="w-full h-24 bg-slate-950 rounded-xl border border-slate-800/80 flex items-center justify-center p-1.5 my-1 overflow-hidden">
                  <SpriteImage
                    spriteId={sprite.id}
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Path Footer */}
                <div className="mt-1 pt-1.5 border-t border-slate-800 flex items-center justify-between text-[9px] text-slate-500 font-mono">
                  <span className="truncate max-w-[150px]" title={sprite.filePath}>
                    {sprite.filePath}
                  </span>
                  <span className="uppercase text-[8px] text-slate-400 font-bold">
                    {sprite.category}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
