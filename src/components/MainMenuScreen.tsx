import React from 'react';
import { PlayerSaveData } from '../types';
import { CHARACTERS, WEAPONS, calculateTotalStats } from '../services/storage';
import { Play, Users, ArrowUpCircle, ShoppingBag, Trophy, Settings } from 'lucide-react';
import { audioManager } from '../services/audio';
import { SpriteId } from '../assets';
import { SpriteImage } from '../services/spriteAssets';

interface MainMenuProps {
  save: PlayerSaveData;
  onPlay: () => void;
  onNavigate: (screen: any) => void;
}

export const MainMenuScreen: React.FC<MainMenuProps> = ({ save, onPlay, onNavigate }) => {
  const currentHero = CHARACTERS[save.selectedCharacter] || CHARACTERS.brutus;
  const currentWeapon = WEAPONS[save.selectedWeapon] || WEAPONS.base_bat;
  const stats = calculateTotalStats(save);

  let heroSpriteId: SpriteId = 'BRUTUS_PORTRAIT';
  if (currentHero.id === 'nika') heroSpriteId = 'NIKA_PORTRAIT';
  else if (currentHero.id === 'volt') heroSpriteId = 'VOLT_PORTRAIT';

  let weaponSpriteId: SpriteId = 'WEAPON_BASE_BAT';
  if (currentWeapon.id === 'mega_hammer') weaponSpriteId = 'WEAPON_MEGA_HAMMER';
  else if (currentWeapon.id === 'cyber_bat') weaponSpriteId = 'WEAPON_CYBER_BAT';
  else if (currentWeapon.id === 'power_guitar') weaponSpriteId = 'WEAPON_POWER_GUITAR';
  else if (currentWeapon.id === 'titan_mallet') weaponSpriteId = 'WEAPON_TITAN_MALLET';
  else if (currentWeapon.id === 'energy_club') weaponSpriteId = 'WEAPON_ENERGY_CLUB';

  const handleAction = (cb: () => void) => {
    audioManager.playClick();
    cb();
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between items-center p-3 sm:p-6 overflow-hidden select-none bg-gradient-to-b from-sky-500 via-blue-600 to-indigo-950">
      {/* Background Animated Comic Sunburst Rays */}
      <div className="absolute inset-0 opacity-15 pointer-events-none flex items-center justify-center">
        <div className="w-[140vw] h-[140vw] rounded-full bg-[radial-gradient(circle,#fef08a_10%,transparent_70%)] animate-[spin_60s_linear_infinite]" />
      </div>

      {/* Top Section: Official SMASH TRIP Logo */}
      <div className="relative z-10 flex flex-col items-center mt-1 sm:mt-2">
        <div className="relative transform hover:scale-105 transition duration-300 w-64 sm:w-80 md:w-96 flex items-center justify-center">
          <SpriteImage
            spriteId="LOGO_SMASH_TRIP"
            className="w-full h-auto max-h-24 sm:max-h-28 object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.6)]"
          />
        </div>
      </div>

      {/* Center Section: Characters & Equipped Loadout Preview */}
      <div className="relative z-10 w-full max-w-4xl flex items-center justify-between px-4 sm:px-12 my-auto">
        {/* Hero Card */}
        <div className="flex flex-col items-center bg-slate-900/85 backdrop-blur-md p-3 sm:p-4 rounded-2xl border-2 border-slate-700 shadow-xl max-w-[200px] sm:max-w-[240px]">
          <div className="relative w-20 h-20 sm:w-28 sm:h-28 flex items-center justify-center bg-slate-800 rounded-xl overflow-hidden border border-slate-600 mb-2 p-1">
            <SpriteImage
              spriteId={heroSpriteId}
              className="w-full h-full object-contain"
            />
            <div className="absolute bottom-1 right-1 bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow">
              FORÇA {stats.power}
            </div>
          </div>
          <span className="font-['Titan_One'] text-white text-base sm:text-lg">{currentHero.name}</span>
          <span className="text-[11px] text-amber-400 font-bold -mt-0.5">{currentHero.title}</span>
          <div className="w-full mt-2 pt-2 border-t border-slate-800 flex justify-between text-[10px] text-slate-300">
            <span>Precisão: {stats.precision}</span>
            <span>Controle: {stats.control}</span>
          </div>
        </div>

        {/* Big PLAY Button */}
        <button
          onClick={() => handleAction(onPlay)}
          className="group relative flex flex-col items-center justify-center w-28 h-28 sm:w-40 sm:h-40 rounded-full bg-gradient-to-b from-emerald-400 via-green-500 to-emerald-700 p-2 shadow-[0_0_40px_rgba(34,197,94,0.6)] border-4 border-yellow-300 hover:scale-105 active:scale-95 transition duration-200"
        >
          <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-20 transition" />
          <Play className="w-10 h-10 sm:w-16 sm:h-16 text-slate-950 fill-slate-950 ml-1 group-hover:scale-110 transition" />
          <span className="font-['Titan_One'] text-white text-base sm:text-2xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] tracking-wider">
            JOGAR!
          </span>
        </button>

        {/* Target Dummy Jack & Weapon Card */}
        <div className="flex flex-col items-center bg-slate-900/85 backdrop-blur-md p-3 sm:p-4 rounded-2xl border-2 border-slate-700 shadow-xl max-w-[200px] sm:max-w-[240px]">
          <div className="relative w-20 h-20 sm:w-28 sm:h-28 flex items-center justify-center bg-slate-800 rounded-xl overflow-hidden border border-slate-600 mb-2 p-1">
            <SpriteImage
              spriteId="DUMMY_PORTRAIT"
              className="w-full h-full object-contain"
            />
            <div className="absolute bottom-1 left-1 w-7 h-7 bg-slate-950/80 rounded-lg p-0.5 border border-slate-700 shadow flex items-center justify-center">
              <SpriteImage
                spriteId={weaponSpriteId}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="absolute bottom-1 right-1 bg-sky-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow">
              ALVO
            </div>
          </div>
          <span className="font-['Titan_One'] text-white text-base sm:text-lg">Dummy Jack</span>
          <span className="text-[11px] text-sky-400 font-bold -mt-0.5">Arma: {currentWeapon.name}</span>
          <div className="w-full mt-2 pt-2 border-t border-slate-800 flex justify-between text-[10px] text-slate-300">
            <span>Bônus Pwr: +{currentWeapon.bonusPower}</span>
            <span>Pre: {currentWeapon.bonusPrecision >= 0 ? `+${currentWeapon.bonusPrecision}` : currentWeapon.bonusPrecision}</span>
          </div>
        </div>
      </div>

      {/* Bottom Section: Navigation Menu Buttons */}
      <div className="relative z-10 w-full max-w-4xl grid grid-cols-5 gap-2 sm:gap-3 mb-1">
        <button
          onClick={() => handleAction(() => onNavigate('HEROES'))}
          className="flex flex-col items-center justify-center py-2 px-1 bg-slate-900/90 hover:bg-slate-800 border-2 border-sky-500/50 rounded-xl text-sky-300 font-bold hover:scale-105 active:scale-95 transition shadow-lg cursor-pointer"
        >
          <Users className="w-5 h-5 sm:w-6 sm:h-6 mb-1 text-sky-400" />
          <span className="text-xs sm:text-sm font-['Titan_One']">HERÓIS</span>
        </button>

        <button
          onClick={() => handleAction(() => onNavigate('UPGRADES'))}
          className="relative flex flex-col items-center justify-center py-2 px-1 bg-slate-900/90 hover:bg-slate-800 border-2 border-amber-500/50 rounded-xl text-amber-300 font-bold hover:scale-105 active:scale-95 transition shadow-lg cursor-pointer"
        >
          {save.statPoints > 0 && (
            <span className="absolute -top-2 -right-1 bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full animate-bounce">
              +{save.statPoints}
            </span>
          )}
          <ArrowUpCircle className="w-5 h-5 sm:w-6 sm:h-6 mb-1 text-amber-400" />
          <span className="text-xs sm:text-sm font-['Titan_One']">UPGRADES</span>
        </button>

        <button
          onClick={() => handleAction(() => onNavigate('SHOP'))}
          className="flex flex-col items-center justify-center py-2 px-1 bg-slate-900/90 hover:bg-slate-800 border-2 border-emerald-500/50 rounded-xl text-emerald-300 font-bold hover:scale-105 active:scale-95 transition shadow-lg cursor-pointer"
        >
          <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 mb-1 text-emerald-400" />
          <span className="text-xs sm:text-sm font-['Titan_One']">LOJA</span>
        </button>

        <button
          onClick={() => handleAction(() => onNavigate('ACHIEVEMENTS'))}
          className="flex flex-col items-center justify-center py-2 px-1 bg-slate-900/90 hover:bg-slate-800 border-2 border-purple-500/50 rounded-xl text-purple-300 font-bold hover:scale-105 active:scale-95 transition shadow-lg cursor-pointer"
        >
          <Trophy className="w-5 h-5 sm:w-6 sm:h-6 mb-1 text-purple-400" />
          <span className="text-xs sm:text-sm font-['Titan_One']">TROFÉUS</span>
        </button>

        <button
          onClick={() => handleAction(() => onNavigate('SETTINGS'))}
          className="flex flex-col items-center justify-center py-2 px-1 bg-slate-900/90 hover:bg-slate-800 border-2 border-slate-600 rounded-xl text-slate-300 font-bold hover:scale-105 active:scale-95 transition shadow-lg cursor-pointer"
        >
          <Settings className="w-5 h-5 sm:w-6 sm:h-6 mb-1 text-slate-400" />
          <span className="text-xs sm:text-sm font-['Titan_One']">AJUSTES</span>
        </button>
      </div>
    </div>
  );
};
