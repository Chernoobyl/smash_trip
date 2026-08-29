import React, { useState } from 'react';
import { PlayerSaveData, WeaponId } from '../types';
import { WEAPONS } from '../services/storage';
import { ArrowLeft, Check, Coins, Shield, Target, Sparkles } from 'lucide-react';
import { audioManager } from '../services/audio';
import { SpriteId } from '../assets';
import { SpriteImage } from '../services/spriteAssets';

interface ShopScreenProps {
  save: PlayerSaveData;
  onBuyWeapon: (weaponId: WeaponId, price: number) => void;
  onEquipWeapon: (weaponId: WeaponId) => void;
  onBack: () => void;
}

export const ShopScreen: React.FC<ShopScreenProps> = ({
  save,
  onBuyWeapon,
  onEquipWeapon,
  onBack,
}) => {
  const [activeTab, setActiveTab] = useState<'weapons' | 'helmets' | 'costumes'>('weapons');
  const weaponList = Object.values(WEAPONS);

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
        <span className="font-['Titan_One'] text-2xl sm:text-3xl text-emerald-400">LOJA SMASH</span>
        <div className="flex items-center gap-1.5 bg-slate-800 px-3 py-1 rounded-xl border border-amber-500/30">
          <Coins className="w-4 h-4 text-amber-400 fill-amber-400" />
          <span className="font-['Titan_One'] text-amber-300 text-sm sm:text-base">
            {save.coins.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="w-full max-w-md mx-auto flex items-center justify-center gap-2 mb-3">
        <button
          onClick={() => {
            audioManager.playClick();
            setActiveTab('weapons');
          }}
          className={`flex-1 py-2 rounded-xl font-['Titan_One'] text-xs uppercase transition cursor-pointer ${
            activeTab === 'weapons'
              ? 'bg-emerald-500 text-slate-950 shadow-md'
              : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          ARMAS
        </button>
        <button
          onClick={() => {
            audioManager.playClick();
            setActiveTab('helmets');
          }}
          className={`flex-1 py-2 rounded-xl font-['Titan_One'] text-xs uppercase transition cursor-pointer ${
            activeTab === 'helmets'
              ? 'bg-emerald-500 text-slate-950 shadow-md'
              : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          CAPACETES DUMMY
        </button>
        <button
          onClick={() => {
            audioManager.playClick();
            setActiveTab('costumes');
          }}
          className={`flex-1 py-2 rounded-xl font-['Titan_One'] text-xs uppercase transition cursor-pointer ${
            activeTab === 'costumes'
              ? 'bg-emerald-500 text-slate-950 shadow-md'
              : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          TRAJES
        </button>
      </div>

      {/* WEAPONS TAB */}
      {activeTab === 'weapons' && (
        <div className="w-full max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 my-auto">
          {weaponList.map((w) => {
            const isUnlocked = save.unlockedWeapons.includes(w.id);
            const isEquipped = save.selectedWeapon === w.id;
            const canAfford = save.coins >= w.price;

            let weaponSpriteId: SpriteId = 'WEAPON_BASE_BAT';
            if (w.id === 'mega_hammer') weaponSpriteId = 'WEAPON_MEGA_HAMMER';
            else if (w.id === 'cyber_bat') weaponSpriteId = 'WEAPON_CYBER_BAT';
            else if (w.id === 'power_guitar') weaponSpriteId = 'WEAPON_POWER_GUITAR';
            else if (w.id === 'titan_mallet') weaponSpriteId = 'WEAPON_TITAN_MALLET';
            else if (w.id === 'energy_club') weaponSpriteId = 'WEAPON_ENERGY_CLUB';

            return (
              <div
                key={w.id}
                className={`relative flex flex-col justify-between p-4 rounded-3xl border-2 backdrop-blur-md transition ${
                  isEquipped
                    ? 'bg-slate-900/95 border-amber-400 shadow-[0_0_25px_rgba(251,191,36,0.25)]'
                    : isUnlocked
                    ? 'bg-slate-900/80 border-slate-700'
                    : 'bg-slate-950/80 border-slate-800'
                }`}
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  <span className="font-['Titan_One'] text-lg text-white">{w.name}</span>
                  {isEquipped && (
                    <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                      EQUIPADA
                    </span>
                  )}
                </div>

                {/* Weapon Icon & Description */}
                <div className="w-full h-28 bg-slate-950/70 rounded-2xl border border-slate-800 my-2 flex flex-col items-center justify-between p-2 relative">
                  <div className="w-16 h-16 flex items-center justify-center">
                    <SpriteImage
                      spriteId={weaponSpriteId}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 text-center px-2 leading-tight">
                    {w.description}
                  </p>
                </div>

                {/* Stat Modifiers */}
                <div className="flex items-center justify-around py-1.5 bg-slate-950/50 rounded-xl border border-slate-800/80 text-xs mb-3 font-bold">
                  <div className="flex items-center gap-1 text-red-400">
                    <Shield className="w-3.5 h-3.5" />
                    <span>+{w.bonusPower} Força</span>
                  </div>
                  <div className="flex items-center gap-1 text-sky-400">
                    <Target className="w-3.5 h-3.5" />
                    <span>
                      {w.bonusPrecision >= 0 ? `+${w.bonusPrecision}` : w.bonusPrecision} Pre
                    </span>
                  </div>
                </div>

                {/* Action Button */}
                {isEquipped ? (
                  <button
                    disabled
                    className="w-full py-2 bg-amber-500 text-slate-950 font-['Titan_One'] text-xs rounded-xl flex items-center justify-center gap-1 cursor-default"
                  >
                    <Check className="w-4 h-4" /> EQUIPADA
                  </button>
                ) : isUnlocked ? (
                  <button
                    onClick={() => {
                      audioManager.playClick();
                      onEquipWeapon(w.id);
                    }}
                    className="w-full py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-['Titan_One'] text-xs rounded-xl flex items-center justify-center gap-1 active:scale-95 transition shadow-md cursor-pointer"
                  >
                    EQUIPAR
                  </button>
                ) : (
                  <button
                    disabled={!canAfford}
                    onClick={() => {
                      audioManager.playBuy();
                      onBuyWeapon(w.id, w.price);
                    }}
                    className={`w-full py-2 rounded-xl font-['Titan_One'] text-xs flex items-center justify-center gap-1.5 transition ${
                      canAfford
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 active:scale-95 shadow-md cursor-pointer'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <Coins className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span>COMPRAR ({w.price.toLocaleString()})</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* HELMETS TAB (Cosmetics & Fun) */}
      {activeTab === 'helmets' && (
        <div className="w-full max-w-2xl mx-auto flex flex-col items-center justify-center p-8 bg-slate-900/80 rounded-3xl border border-slate-800 my-auto text-center">
          <Sparkles className="w-12 h-12 text-yellow-400 mb-2" />
          <span className="font-['Titan_One'] text-xl text-white">CAPACETES DO DUMMY JACK</span>
          <p className="text-xs text-slate-400 max-w-sm mt-1">
            Personalize a proteção e estilo do Dummy Jack com Capacetes Espaciais, Viking, e Cibernéticos em breve!
          </p>
        </div>
      )}

      {/* COSTUMES TAB */}
      {activeTab === 'costumes' && (
        <div className="w-full max-w-2xl mx-auto flex flex-col items-center justify-center p-8 bg-slate-900/80 rounded-3xl border border-slate-800 my-auto text-center">
          <Sparkles className="w-12 h-12 text-emerald-400 mb-2" />
          <span className="font-['Titan_One'] text-xl text-white">TRAJES DE GALA E COMBATE</span>
          <p className="text-xs text-slate-400 max-w-sm mt-1">
            Skins exclusivas para Brutus, Nika e Volt com efeitos visuais de tacada neon!
          </p>
        </div>
      )}

      <div className="text-center text-[11px] text-slate-400 mt-2">
        Armas com maior poder arremessam o Dummy Jack a distâncias astronômicas!
      </div>
    </div>
  );
};
