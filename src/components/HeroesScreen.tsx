import React from 'react';
import { PlayerSaveData, CharacterId } from '../types';
import { CHARACTERS } from '../services/storage';
import { ArrowLeft, Check, Lock, Shield, Zap, Target } from 'lucide-react';
import { audioManager } from '../services/audio';
import { SpriteId } from '../assets';
import { SpriteImage } from '../services/spriteAssets';

interface HeroesScreenProps {
  save: PlayerSaveData;
  onSelectHero: (id: CharacterId) => void;
  onBack: () => void;
}

export const HeroesScreen: React.FC<HeroesScreenProps> = ({ save, onSelectHero, onBack }) => {
  const heroList = Object.values(CHARACTERS);

  return (
    <div className="relative w-full h-full flex flex-col justify-between p-3 sm:p-6 overflow-y-auto select-none bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950">
      {/* Header */}
      <div className="flex items-center justify-between w-full max-w-4xl mx-auto mb-2">
        <button
          onClick={() => {
            audioManager.playClick();
            onBack();
          }}
          className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 text-sm font-bold text-slate-300 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> VOLTAR
        </button>
        <span className="font-['Titan_One'] text-2xl sm:text-3xl text-sky-400">HERÓIS SMASH</span>
        <div className="w-20" />
      </div>

      {/* Hero Selection Cards */}
      <div className="w-full max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 my-auto">
        {heroList.map((hero) => {
          const isUnlocked = save.unlockedCharacters.includes(hero.id);
          const isSelected = save.selectedCharacter === hero.id;

          let heroSpriteId: SpriteId = 'BRUTUS_PORTRAIT';
          if (hero.id === 'nika') heroSpriteId = 'NIKA_PORTRAIT';
          else if (hero.id === 'volt') heroSpriteId = 'VOLT_PORTRAIT';

          return (
            <div
              key={hero.id}
              className={`relative flex flex-col justify-between p-4 rounded-3xl border-2 backdrop-blur-md transition duration-200 ${
                isSelected
                  ? 'bg-slate-900/95 border-amber-400 shadow-[0_0_25px_rgba(251,191,36,0.3)]'
                  : isUnlocked
                  ? 'bg-slate-900/80 border-slate-700 hover:border-slate-500'
                  : 'bg-slate-950/80 border-slate-800 opacity-60'
              }`}
            >
              {/* Top Hero Header */}
              <div className="flex items-center justify-between">
                <span className="font-['Titan_One'] text-xl text-white">{hero.name}</span>
                {isSelected && (
                  <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                    EQUIPADO
                  </span>
                )}
                {!isUnlocked && (
                  <div className="flex items-center gap-1 text-[11px] text-red-400 font-bold">
                    <Lock className="w-3.5 h-3.5" />
                    <span>{hero.unlockDistanceMeters / 1000} km</span>
                  </div>
                )}
              </div>

              <span className="text-xs font-bold text-amber-400 -mt-1">{hero.title}</span>

              {/* Avatar Preview Box */}
              <div className="w-full h-36 bg-slate-950/70 rounded-2xl border border-slate-800 my-3 flex flex-col items-center justify-between p-2 relative overflow-hidden">
                <div className="w-24 h-24 rounded-xl overflow-hidden shadow-lg border border-slate-700 bg-slate-900/60 p-1 flex items-center justify-center">
                  <SpriteImage
                    spriteId={heroSpriteId}
                    className="w-full h-full object-contain"
                  />
                </div>
                <p className="text-[10px] text-slate-400 text-center px-2 leading-tight">
                  {hero.description}
                </p>
              </div>

              {/* Stats Bars */}
              <div className="space-y-1.5 text-xs text-slate-300">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Shield className="w-3 h-3 text-red-400" /> Força
                  </span>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-2.5 h-2 rounded-sm ${
                          i < hero.baseStats.power ? 'bg-red-500' : 'bg-slate-800'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Target className="w-3 h-3 text-sky-400" /> Precisão
                  </span>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-2.5 h-2 rounded-sm ${
                          i < hero.baseStats.precision ? 'bg-sky-500' : 'bg-slate-800'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Zap className="w-3 h-3 text-amber-400" /> Controle
                  </span>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-2.5 h-2 rounded-sm ${
                          i < hero.baseStats.control ? 'bg-amber-500' : 'bg-slate-800'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                disabled={!isUnlocked || isSelected}
                onClick={() => {
                  audioManager.playClick();
                  onSelectHero(hero.id);
                }}
                className={`w-full mt-4 py-2.5 rounded-xl font-['Titan_One'] text-xs uppercase flex items-center justify-center gap-1.5 transition ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 cursor-default'
                    : isUnlocked
                    ? 'bg-sky-500 hover:bg-sky-400 text-slate-950 active:scale-95 shadow-md cursor-pointer'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                {isSelected ? (
                  <>
                    <Check className="w-4 h-4" /> SELECIONADO
                  </>
                ) : isUnlocked ? (
                  'ESCOLHER HERÓI'
                ) : (
                  `DESBLOQUEIE EM ${hero.unlockDistanceMeters}m`
                )}
              </button>
            </div>
          );
        })}
      </div>

      <div className="text-center text-[11px] text-slate-400 mt-2">
        Atinja distâncias maiores no jogo para liberar Nika (2 km) e Volt (5 km)!
      </div>
    </div>
  );
};
