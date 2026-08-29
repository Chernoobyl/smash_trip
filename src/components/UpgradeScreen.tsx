import React from 'react';
import { PlayerSaveData } from '../types';
import { ArrowLeft, Shield, Target, Zap, Plus, Coins } from 'lucide-react';
import { audioManager } from '../services/audio';

interface UpgradeScreenProps {
  save: PlayerSaveData;
  onUpgradeStat: (stat: 'power' | 'precision' | 'control') => void;
  onBuyStatWithCoins: (stat: 'power' | 'precision' | 'control', cost: number) => void;
  onBack: () => void;
}

export const UpgradeScreen: React.FC<UpgradeScreenProps> = ({
  save,
  onUpgradeStat,
  onBuyStatWithCoins,
  onBack,
}) => {
  const getCoinCost = (currentVal: number) => {
    return Math.floor(250 * Math.pow(1.35, currentVal));
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between p-3 sm:p-6 overflow-y-auto select-none bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950">
      {/* Header */}
      <div className="flex items-center justify-between w-full max-w-3xl mx-auto mb-2">
        <button
          onClick={() => {
            audioManager.playClick();
            onBack();
          }}
          className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 text-sm font-bold text-slate-300"
        >
          <ArrowLeft className="w-4 h-4" /> VOLTAR
        </button>
        <span className="font-['Titan_One'] text-2xl sm:text-3xl text-amber-400">UPGRADES DE ATRIBUTOS</span>
        <div className="w-20" />
      </div>

      {/* Available Points & Coins Banner */}
      <div className="w-full max-w-3xl mx-auto flex items-center justify-between bg-slate-900/90 p-4 rounded-2xl border-2 border-slate-700 mb-3 shadow-xl">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 font-black flex items-center justify-center font-['Titan_One'] text-xl">
            {save.statPoints}
          </div>
          <div>
            <span className="font-['Titan_One'] text-white text-base">PONTOS DE ATRIBUTO</span>
            <p className="text-[11px] text-slate-400">Ganhe +1 ponto a cada novo nível alcançado!</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-xl border border-amber-500/30">
          <Coins className="w-5 h-5 text-amber-400 fill-amber-400" />
          <span className="font-['Titan_One'] text-amber-300 text-base">{save.coins.toLocaleString()}</span>
        </div>
      </div>

      {/* Upgradable Stats List */}
      <div className="w-full max-w-3xl mx-auto space-y-3 my-auto">
        {/* POWER */}
        <div className="bg-slate-900/80 p-4 rounded-2xl border-2 border-red-500/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-600/20 text-red-500 rounded-2xl border border-red-500/40">
              <Shield className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-['Titan_One'] text-white text-lg">FORÇA BRUTA</span>
                <span className="bg-red-500 text-white text-xs font-black px-2 py-0.5 rounded-full">
                  NÍVEL {save.upgrades.power}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Aumenta a velocidade de tacada inicial e o impacto do Power Smash.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {save.statPoints > 0 ? (
              <button
                onClick={() => {
                  audioManager.playUpgrade();
                  onUpgradeStat('power');
                }}
                className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-['Titan_One'] text-xs rounded-xl flex items-center gap-1.5 shadow-lg active:scale-95 transition"
              >
                <Plus className="w-4 h-4" /> USAR 1 PONTO
              </button>
            ) : (
              <button
                disabled={save.coins < getCoinCost(save.upgrades.power)}
                onClick={() => {
                  audioManager.playUpgrade();
                  onBuyStatWithCoins('power', getCoinCost(save.upgrades.power));
                }}
                className={`px-3 py-2 rounded-xl font-['Titan_One'] text-xs flex items-center gap-1.5 transition ${
                  save.coins >= getCoinCost(save.upgrades.power)
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 active:scale-95'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                <Coins className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span>{getCoinCost(save.upgrades.power).toLocaleString()}</span>
              </button>
            )}
          </div>
        </div>

        {/* PRECISION */}
        <div className="bg-slate-900/80 p-4 rounded-2xl border-2 border-sky-500/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-sky-600/20 text-sky-400 rounded-2xl border border-sky-500/40">
              <Target className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-['Titan_One'] text-white text-lg">PRECISÃO CIRÚRGICA</span>
                <span className="bg-sky-500 text-white text-xs font-black px-2 py-0.5 rounded-full">
                  NÍVEL {save.upgrades.precision}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Amplia a zona PERFECT de tacada e aumenta a chance de acertos críticos (+8%).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {save.statPoints > 0 ? (
              <button
                onClick={() => {
                  audioManager.playUpgrade();
                  onUpgradeStat('precision');
                }}
                className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-['Titan_One'] text-xs rounded-xl flex items-center gap-1.5 shadow-lg active:scale-95 transition"
              >
                <Plus className="w-4 h-4" /> USAR 1 PONTO
              </button>
            ) : (
              <button
                disabled={save.coins < getCoinCost(save.upgrades.precision)}
                onClick={() => {
                  audioManager.playUpgrade();
                  onBuyStatWithCoins('precision', getCoinCost(save.upgrades.precision));
                }}
                className={`px-3 py-2 rounded-xl font-['Titan_One'] text-xs flex items-center gap-1.5 transition ${
                  save.coins >= getCoinCost(save.upgrades.precision)
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 active:scale-95'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                <Coins className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span>{getCoinCost(save.upgrades.precision).toLocaleString()}</span>
              </button>
            )}
          </div>
        </div>

        {/* CONTROL */}
        <div className="bg-slate-900/80 p-4 rounded-2xl border-2 border-emerald-500/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-600/20 text-emerald-400 rounded-2xl border border-emerald-500/40">
              <Zap className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-['Titan_One'] text-white text-lg">CONTROLE AERODINÂMICO</span>
                <span className="bg-emerald-500 text-white text-xs font-black px-2 py-0.5 rounded-full">
                  NÍVEL {save.upgrades.control}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Melhora as manobras aéreas de planar/mergulhar e reduz a resistência do ar.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {save.statPoints > 0 ? (
              <button
                onClick={() => {
                  audioManager.playUpgrade();
                  onUpgradeStat('control');
                }}
                className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-['Titan_One'] text-xs rounded-xl flex items-center gap-1.5 shadow-lg active:scale-95 transition"
              >
                <Plus className="w-4 h-4" /> USAR 1 PONTO
              </button>
            ) : (
              <button
                disabled={save.coins < getCoinCost(save.upgrades.control)}
                onClick={() => {
                  audioManager.playUpgrade();
                  onBuyStatWithCoins('control', getCoinCost(save.upgrades.control));
                }}
                className={`px-3 py-2 rounded-xl font-['Titan_One'] text-xs flex items-center gap-1.5 transition ${
                  save.coins >= getCoinCost(save.upgrades.control)
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 active:scale-95'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                <Coins className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span>{getCoinCost(save.upgrades.control).toLocaleString()}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="text-center text-[11px] text-slate-400 mt-2">
        Dica: Invista em Força para lançamentos longos e Controle para pegar mais Boosters e Moedas!
      </div>
    </div>
  );
};
