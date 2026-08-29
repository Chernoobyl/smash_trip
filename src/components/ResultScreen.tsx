import React from 'react';
import { FlightResult, PlayerSaveData } from '../types';
import { RotateCcw, ArrowUpCircle, ShoppingBag, Home, Trophy, Coins, Star, Flame, Sparkles } from 'lucide-react';
import { audioManager } from '../services/audio';

interface ResultScreenProps {
  result: FlightResult;
  save: PlayerSaveData;
  onPlayAgain: () => void;
  onNavigate: (screen: any) => void;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({
  result,
  save,
  onPlayAgain,
  onNavigate,
}) => {
  const handleAction = (cb: () => void) => {
    audioManager.playClick();
    cb();
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between p-3 sm:p-6 overflow-y-auto select-none bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950">
      {/* Top Banner / New Record Fanfare */}
      <div className="flex flex-col items-center mt-2">
        {result.isNewRecord ? (
          <div className="flex flex-col items-center animate-bounce mb-1">
            <div className="flex items-center gap-2 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 px-6 py-1.5 rounded-full border-2 border-yellow-200 shadow-[0_0_30px_rgba(234,179,8,0.8)]">
              <Trophy className="w-6 h-6 text-slate-950 fill-yellow-100" />
              <span className="font-['Titan_One'] text-slate-950 text-xl sm:text-2xl tracking-wider">
                NOVO RECORDE!
              </span>
              <Sparkles className="w-6 h-6 text-slate-950" />
            </div>
          </div>
        ) : (
          <span className="font-['Titan_One'] text-2xl sm:text-3xl text-slate-300 tracking-wider">
            RESULTADO DO VOO
          </span>
        )}

        {/* Big Distance Display */}
        <div className="flex items-baseline gap-2 mt-1">
          <span className="font-['Titan_One'] text-5xl sm:text-7xl text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 via-amber-400 to-orange-500 drop-shadow-[0_4px_6px_rgba(0,0,0,0.8)]">
            {result.distance.toLocaleString()}
          </span>
          <span className="font-['Titan_One'] text-2xl sm:text-3xl text-yellow-300">METROS</span>
        </div>
      </div>

      {/* Unlocked Alerts */}
      {result.unlockedHero && (
        <div className="bg-gradient-to-r from-pink-600 to-purple-600 px-6 py-2 rounded-2xl border-2 border-yellow-300 shadow-xl flex items-center gap-2 my-1 animate-pulse">
          <Sparkles className="w-5 h-5 text-yellow-300" />
          <span className="font-['Titan_One'] text-white text-sm sm:text-base">
            NOVO HERÓI DESBLOQUEADO: {result.unlockedHero.toUpperCase()}!
          </span>
        </div>
      )}

      {/* Stats Breakdown Bento Grid */}
      <div className="w-full max-w-2xl grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 my-auto">
        {/* Max Altitude */}
        <div className="bg-slate-900/90 p-3 rounded-2xl border border-sky-500/30 flex flex-col items-center">
          <span className="text-[10px] font-bold text-sky-400 uppercase">Altitude Máx.</span>
          <span className="font-['Titan_One'] text-xl sm:text-2xl text-white">
            {result.maxAltitude} <span className="text-xs text-sky-300">m</span>
          </span>
        </div>

        {/* Max Speed */}
        <div className="bg-slate-900/90 p-3 rounded-2xl border border-red-500/30 flex flex-col items-center">
          <span className="text-[10px] font-bold text-red-400 uppercase">Velocidade Máx.</span>
          <span className="font-['Titan_One'] text-xl sm:text-2xl text-white">
            {result.maxSpeed} <span className="text-xs text-red-300">km/h</span>
          </span>
        </div>

        {/* Max Combo */}
        <div className="bg-slate-900/90 p-3 rounded-2xl border border-amber-500/30 flex flex-col items-center">
          <span className="text-[10px] font-bold text-amber-400 uppercase">Combo Máx.</span>
          <div className="flex items-center gap-1">
            <Flame className="w-4 h-4 text-amber-400" />
            <span className="font-['Titan_One'] text-xl sm:text-2xl text-white">
              x{result.maxCombo}
            </span>
          </div>
        </div>

        {/* Boosters Hit */}
        <div className="bg-slate-900/90 p-3 rounded-2xl border border-emerald-500/30 flex flex-col items-center">
          <span className="text-[10px] font-bold text-emerald-400 uppercase">Boosters</span>
          <span className="font-['Titan_One'] text-xl sm:text-2xl text-white">
            {result.boostersHit}
          </span>
        </div>
      </div>

      {/* Rewards Row */}
      <div className="w-full max-w-md flex items-center justify-around bg-slate-900/95 p-3 rounded-2xl border-2 border-slate-700 shadow-xl my-2">
        <div className="flex items-center gap-2">
          <Coins className="w-7 h-7 text-amber-400 fill-amber-400" />
          <div className="flex flex-col">
            <span className="text-[9px] font-bold uppercase text-slate-400">Moedas Ganhas</span>
            <span className="font-['Titan_One'] text-xl text-amber-300">
              +{result.coinsEarned.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="w-px h-8 bg-slate-700" />

        <div className="flex items-center gap-2">
          <Star className="w-7 h-7 text-sky-400 fill-sky-400" />
          <div className="flex flex-col">
            <span className="text-[9px] font-bold uppercase text-slate-400">XP Ganho</span>
            <span className="font-['Titan_One'] text-xl text-sky-300">
              +{result.xpEarned.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="w-full max-w-2xl grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-2">
        <button
          onClick={() => handleAction(onPlayAgain)}
          className="col-span-2 sm:col-span-1 py-3 px-4 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-slate-950 font-['Titan_One'] text-base rounded-2xl flex items-center justify-center gap-2 shadow-lg border-2 border-yellow-300 active:scale-95 transition"
        >
          <RotateCcw className="w-5 h-5 text-slate-950" /> JOGAR DE NOVO
        </button>

        <button
          onClick={() => handleAction(() => onNavigate('UPGRADES'))}
          className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-amber-300 font-['Titan_One'] text-sm rounded-2xl flex items-center justify-center gap-2 border border-amber-500/40 active:scale-95 transition"
        >
          <ArrowUpCircle className="w-4 h-4 text-amber-400" /> UPGRADES
        </button>

        <button
          onClick={() => handleAction(() => onNavigate('SHOP'))}
          className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-emerald-300 font-['Titan_One'] text-sm rounded-2xl flex items-center justify-center gap-2 border border-emerald-500/40 active:scale-95 transition"
        >
          <ShoppingBag className="w-4 h-4 text-emerald-400" /> LOJA
        </button>

        <button
          onClick={() => handleAction(() => onNavigate('MAIN_MENU'))}
          className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-['Titan_One'] text-sm rounded-2xl flex items-center justify-center gap-2 border border-slate-600 active:scale-95 transition"
        >
          <Home className="w-4 h-4" /> MENU
        </button>
      </div>
    </div>
  );
};
