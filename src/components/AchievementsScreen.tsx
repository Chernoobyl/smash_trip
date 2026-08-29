import React from 'react';
import { PlayerSaveData } from '../types';
import { ACHIEVEMENTS } from '../services/storage';
import { ArrowLeft, Trophy, CheckCircle2, Lock, Coins, Star } from 'lucide-react';
import { audioManager } from '../services/audio';

interface AchievementsScreenProps {
  save: PlayerSaveData;
  onBack: () => void;
}

export const AchievementsScreen: React.FC<AchievementsScreenProps> = ({ save, onBack }) => {
  const completedCount = save.unlockedAchievements.length;

  return (
    <div className="relative w-full h-full flex flex-col justify-between p-3 sm:p-6 overflow-y-auto select-none bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950">
      {/* Header */}
      <div className="flex items-center justify-between w-full max-w-4xl mx-auto mb-2">
        <button
          onClick={() => {
            audioManager.playClick();
            onBack();
          }}
          className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 text-sm font-bold text-slate-300"
        >
          <ArrowLeft className="w-4 h-4" /> VOLTAR
        </button>
        <span className="font-['Titan_One'] text-2xl sm:text-3xl text-purple-400">TROFÉUS & CONQUISTAS</span>
        <div className="flex items-center gap-1.5 bg-purple-900/50 px-3 py-1 rounded-xl border border-purple-500/30">
          <Trophy className="w-4 h-4 text-purple-400" />
          <span className="font-['Titan_One'] text-purple-300 text-xs sm:text-sm">
            {completedCount} / {ACHIEVEMENTS.length}
          </span>
        </div>
      </div>

      {/* Achievements List */}
      <div className="w-full max-w-4xl mx-auto space-y-2.5 my-auto">
        {ACHIEVEMENTS.map((ach) => {
          const isUnlocked = save.unlockedAchievements.includes(ach.id);

          return (
            <div
              key={ach.id}
              className={`flex items-center justify-between p-3.5 rounded-2xl border-2 transition ${
                isUnlocked
                  ? 'bg-slate-900/90 border-purple-500/50 shadow-md'
                  : 'bg-slate-950/70 border-slate-800 opacity-60'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-['Titan_One'] ${
                    isUnlocked
                      ? 'bg-purple-600/30 text-purple-300 border border-purple-500/50'
                      : 'bg-slate-900 text-slate-600 border border-slate-800'
                  }`}
                >
                  {isUnlocked ? <CheckCircle2 className="w-6 h-6 text-purple-400" /> : <Lock className="w-5 h-5" />}
                </div>

                <div>
                  <span className="font-['Titan_One'] text-white text-base">{ach.title}</span>
                  <p className="text-xs text-slate-400 mt-0.5">{ach.description}</p>
                </div>
              </div>

              {/* Rewards Pill */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800 text-xs font-bold text-amber-300">
                  <Coins className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span>+{ach.rewardCoins}</span>
                </div>
                <div className="flex items-center gap-1 bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800 text-xs font-bold text-sky-300">
                  <Star className="w-3.5 h-3.5 text-sky-400 fill-sky-400" />
                  <span>+{ach.rewardXp} XP</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-center text-[11px] text-slate-400 mt-2">
        Complete proezas épicas para acumular moedas e subir de nível mais rapidamente!
      </div>
    </div>
  );
};
