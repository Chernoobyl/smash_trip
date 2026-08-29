import React, { useState, useEffect, useCallback } from 'react';
import {
  PlayerSaveData,
  FlightResult,
  CharacterId,
  WeaponId,
} from './types';
import {
  loadGameSave,
  saveGameSave,
  resetGameSave,
} from './services/storage';
import { audioManager } from './services/audio';

import { TopBar } from './components/TopBar';
import { MainMenuScreen } from './components/MainMenuScreen';
import { GameScreen } from './components/GameScreen';
import { ResultScreen } from './components/ResultScreen';
import { HeroesScreen } from './components/HeroesScreen';
import { UpgradeScreen } from './components/UpgradeScreen';
import { ShopScreen } from './components/ShopScreen';
import { AchievementsScreen } from './components/AchievementsScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { AssetDebugScreen } from './components/AssetDebugScreen';

type ScreenType =
  | 'MAIN_MENU'
  | 'GAME'
  | 'RESULT'
  | 'HEROES'
  | 'UPGRADES'
  | 'SHOP'
  | 'ACHIEVEMENTS'
  | 'SETTINGS'
  | 'ASSET_DEBUG';

export default function App() {
  const [save, setSave] = useState<PlayerSaveData>(() => loadGameSave());
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('MAIN_MENU');
  const [lastFlightResult, setLastFlightResult] = useState<FlightResult | null>(null);
  const [showMobileFrame, setShowMobileFrame] = useState(false);

  // Sync save changes with localStorage and audio settings
  const updateSave = useCallback((newSave: PlayerSaveData) => {
    setSave(newSave);
    saveGameSave(newSave);
  }, []);

  useEffect(() => {
    audioManager.setSfxEnabled(save.settings.sfx);
    audioManager.setMusicEnabled(save.settings.music);
  }, [save.settings]);

  // Audio start on first touch/interaction
  useEffect(() => {
    const handleFirstInteraction = () => {
      audioManager.startMusic();
      window.removeEventListener('pointerdown', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };

    window.addEventListener('pointerdown', handleFirstInteraction);
    window.addEventListener('keydown', handleFirstInteraction);

    return () => {
      window.removeEventListener('pointerdown', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };
  }, []);

  // Handlers
  const handlePlay = () => {
    setCurrentScreen('GAME');
  };

  const handleFinishFlight = (result: FlightResult) => {
    setLastFlightResult(result);
    // Reload updated save from storage (engine updates save values)
    const freshSave = loadGameSave();
    setSave(freshSave);
    setCurrentScreen('RESULT');
  };

  const handleSelectHero = (id: CharacterId) => {
    const updated: PlayerSaveData = { ...save, selectedCharacter: id };
    updateSave(updated);
  };

  const handleUpgradeStat = (stat: 'power' | 'precision' | 'control') => {
    if (save.statPoints <= 0) return;
    const updated: PlayerSaveData = {
      ...save,
      statPoints: save.statPoints - 1,
      upgrades: {
        ...save.upgrades,
        [stat]: save.upgrades[stat] + 1,
      },
    };
    updateSave(updated);
  };

  const handleBuyStatWithCoins = (stat: 'power' | 'precision' | 'control', cost: number) => {
    if (save.coins < cost) return;
    const updated: PlayerSaveData = {
      ...save,
      coins: save.coins - cost,
      upgrades: {
        ...save.upgrades,
        [stat]: save.upgrades[stat] + 1,
      },
    };
    updateSave(updated);
  };

  const handleBuyWeapon = (weaponId: WeaponId, price: number) => {
    if (save.coins < price) return;
    const updated: PlayerSaveData = {
      ...save,
      coins: save.coins - price,
      unlockedWeapons: [...save.unlockedWeapons, weaponId],
      selectedWeapon: weaponId,
    };
    updateSave(updated);
  };

  const handleEquipWeapon = (weaponId: WeaponId) => {
    const updated: PlayerSaveData = {
      ...save,
      selectedWeapon: weaponId,
    };
    updateSave(updated);
  };

  const handleResetData = () => {
    const fresh = resetGameSave();
    setSave(fresh);
    setCurrentScreen('MAIN_MENU');
  };

  // Render Screen Content
  const renderScreen = () => {
    switch (currentScreen) {
      case 'MAIN_MENU':
        return (
          <MainMenuScreen
            save={save}
            onPlay={handlePlay}
            onNavigate={(s) => setCurrentScreen(s)}
          />
        );
      case 'GAME':
        return (
          <GameScreen
            save={save}
            onFinishFlight={handleFinishFlight}
            onExitToMenu={() => setCurrentScreen('MAIN_MENU')}
          />
        );
      case 'RESULT':
        return lastFlightResult ? (
          <ResultScreen
            result={lastFlightResult}
            save={save}
            onPlayAgain={handlePlay}
            onNavigate={(s) => setCurrentScreen(s)}
          />
        ) : (
          <MainMenuScreen
            save={save}
            onPlay={handlePlay}
            onNavigate={(s) => setCurrentScreen(s)}
          />
        );
      case 'HEROES':
        return (
          <HeroesScreen
            save={save}
            onSelectHero={handleSelectHero}
            onBack={() => setCurrentScreen('MAIN_MENU')}
          />
        );
      case 'UPGRADES':
        return (
          <UpgradeScreen
            save={save}
            onUpgradeStat={handleUpgradeStat}
            onBuyStatWithCoins={handleBuyStatWithCoins}
            onBack={() => setCurrentScreen('MAIN_MENU')}
          />
        );
      case 'SHOP':
        return (
          <ShopScreen
            save={save}
            onBuyWeapon={handleBuyWeapon}
            onEquipWeapon={handleEquipWeapon}
            onBack={() => setCurrentScreen('MAIN_MENU')}
          />
        );
      case 'ACHIEVEMENTS':
        return (
          <AchievementsScreen
            save={save}
            onBack={() => setCurrentScreen('MAIN_MENU')}
          />
        );
      case 'SETTINGS':
        return (
          <SettingsScreen
            save={save}
            onUpdateSave={updateSave}
            onResetData={handleResetData}
            onToggleFrame={() => setShowMobileFrame(!showMobileFrame)}
            showFrame={showMobileFrame}
            onOpenSpritesDebug={() => setCurrentScreen('ASSET_DEBUG')}
            onBack={() => setCurrentScreen('MAIN_MENU')}
          />
        );
      case 'ASSET_DEBUG':
        return (
          <AssetDebugScreen
            onBack={() => setCurrentScreen('SETTINGS')}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-screen h-screen overflow-hidden bg-slate-950 flex items-center justify-center font-['Fredoka']">
      {/* If Mobile Frame Mode is enabled on desktop, render inside a styled landscape smartphone frame */}
      {showMobileFrame ? (
        <div className="relative w-[920px] h-[520px] bg-slate-900 rounded-[40px] p-4 shadow-[0_0_80px_rgba(0,0,0,0.9)] border-4 border-slate-700 flex flex-col justify-between overflow-hidden">
          {/* Camera Notch Indicator */}
          <div className="absolute left-1/2 -translate-x-1/2 top-2 w-28 h-4 bg-slate-950 rounded-full z-50 flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-800 border border-slate-700" />
          </div>

          <div className="w-full h-full rounded-[28px] overflow-hidden flex flex-col relative bg-slate-950 border border-slate-800">
            {currentScreen !== 'GAME' && (
              <TopBar
                save={save}
                onOpenSettings={() => setCurrentScreen('SETTINGS')}
                onToggleFrame={() => setShowMobileFrame(false)}
              />
            )}
            <div className="flex-1 w-full h-full overflow-hidden relative">
              {renderScreen()}
            </div>
          </div>
        </div>
      ) : (
        /* Fullscreen Mobile / Desktop experience */
        <div className="w-full h-full flex flex-col overflow-hidden relative">
          {currentScreen !== 'GAME' && (
            <TopBar
              save={save}
              onOpenSettings={() => setCurrentScreen('SETTINGS')}
              onToggleFrame={() => setShowMobileFrame(true)}
            />
          )}
          <main className="flex-1 w-full h-full overflow-hidden relative">
            {renderScreen()}
          </main>
        </div>
      )}
    </div>
  );
}
