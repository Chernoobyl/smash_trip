import React from 'react';
import { PlayerSaveData } from '../types';
import { getXpForNextLevel } from '../services/storage';
import { Coins, Trophy, Zap, Volume2, VolumeX, Smartphone, Settings } from 'lucide-react';
import { audioManager } from '../services/audio';

interface TopBarProps {
  save: PlayerSaveData;
  onOpenSettings: () => void;
  onToggleFrame: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ save, onOpenSettings, onToggleFrame }) => {
  const nextXp = getXpForNextLevel(save.level);
  const xpProgress = Math.min(100, (save.xp / nextXp) * 100);

  return (
    <header className="w-full flex items-center justify-between px-3 sm:px-6 py-2 bg-slate-900/90 backdrop-blur border-b border-slate-800 z-30 select-none">
      {/* Level & XP */}
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-amber-500 text-slate-950 font-black rounded-xl shadow-md border-2 border-amber-300 text-sm sm:text-base font-['Titan_One']">
          {save.level}
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
            <span>NÍVEL {save.level}</span>
            {save.statPoints > 0 && (
              <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.2 rounded-full animate-pulse">
                +{save.statPoints} PTS!
              </span>
            )}
          </div>
          <div className="w-24 sm:w-36 h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-yellow-300 transition-all duration-300"
              style={{ width: `${xpProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Coins & Record */}
      <div className="flex items-center gap-3 sm:gap-6">
        {/* Coins */}
        <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 sm:px-3.5 py-1 rounded-xl border border-amber-500/30">
          <Coins className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 fill-amber-400 animate-bounce" />
          <span className="font-['Titan_One'] text-amber-300 text-sm sm:text-base tracking-wide">
            {save.coins.toLocaleString()}
          </span>
        </div>

        {/* Best Distance */}
        <div className="hidden xs:flex items-center gap-1.5 bg-slate-800/80 px-2.5 sm:px-3.5 py-1 rounded-xl border border-sky-500/30">
          <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-sky-400" />
          <div className="flex flex-col text-right">
            <span className="text-[9px] uppercase font-bold text-slate-400 leading-none">Recorde</span>
            <span className="font-['Titan_One'] text-sky-300 text-xs sm:text-sm">
              {save.bestDistance.toLocaleString()}m
            </span>
          </div>
        </div>

        {/* Quick Settings & Frame Toggle */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              const next = !save.settings.music;
              audioManager.setMusicEnabled(next);
              save.settings.music = next;
              audioManager.playClick();
            }}
            title="Música On/Off"
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 active:scale-95 transition"
          >
            {save.settings.music ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-red-400" />}
          </button>
          <button
            onClick={onToggleFrame}
            title="Alternar Moldura Mobile"
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 active:scale-95 transition"
          >
            <Smartphone className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenSettings}
            title="Configurações"
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 active:scale-95 transition"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
