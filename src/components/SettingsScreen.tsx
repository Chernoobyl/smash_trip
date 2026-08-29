import React from 'react';
import { PlayerSaveData } from '../types';
import { ArrowLeft, Volume2, Music, Vibrate, Trash2, Smartphone, Layers } from 'lucide-react';
import { audioManager } from '../services/audio';

interface SettingsScreenProps {
  save: PlayerSaveData;
  onUpdateSave: (newSave: PlayerSaveData) => void;
  onResetData: () => void;
  onToggleFrame: () => void;
  showFrame: boolean;
  onOpenSpritesDebug?: () => void;
  onBack: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  save,
  onUpdateSave,
  onResetData,
  onToggleFrame,
  showFrame,
  onOpenSpritesDebug,
  onBack,
}) => {
  const toggleSfx = () => {
    const updated = { ...save, settings: { ...save.settings, sfx: !save.settings.sfx } };
    audioManager.setSfxEnabled(updated.settings.sfx);
    audioManager.playClick();
    onUpdateSave(updated);
  };

  const toggleMusic = () => {
    const updated = { ...save, settings: { ...save.settings, music: !save.settings.music } };
    audioManager.setMusicEnabled(updated.settings.music);
    audioManager.playClick();
    onUpdateSave(updated);
  };

  const toggleVibration = () => {
    const updated = { ...save, settings: { ...save.settings, vibration: !save.settings.vibration } };
    audioManager.playClick();
    onUpdateSave(updated);
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between p-3 sm:p-6 overflow-y-auto select-none bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950">
      {/* Header */}
      <div className="flex items-center justify-between w-full max-w-2xl mx-auto mb-2">
        <button
          onClick={() => {
            audioManager.playClick();
            onBack();
          }}
          className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 text-sm font-bold text-slate-300 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> VOLTAR
        </button>
        <span className="font-['Titan_One'] text-2xl sm:text-3xl text-slate-200">AJUSTES DO JOGO</span>
        <div className="w-20" />
      </div>

      {/* Settings Options */}
      <div className="w-full max-w-2xl mx-auto space-y-3 my-auto">
        {/* SFX */}
        <div className="flex items-center justify-between p-4 bg-slate-900/80 rounded-2xl border border-slate-700">
          <div className="flex items-center gap-3">
            <Volume2 className="w-6 h-6 text-sky-400" />
            <div>
              <span className="font-['Titan_One'] text-white text-base">EFEITOS SONOROS (SFX)</span>
              <p className="text-xs text-slate-400">Tacadas cômicas, explosões e impulsos sonoros</p>
            </div>
          </div>
          <button
            onClick={toggleSfx}
            className={`w-14 h-8 rounded-full p-1 transition cursor-pointer ${
              save.settings.sfx ? 'bg-emerald-500' : 'bg-slate-700'
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full bg-white transition transform ${
                save.settings.sfx ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Music */}
        <div className="flex items-center justify-between p-4 bg-slate-900/80 rounded-2xl border border-slate-700">
          <div className="flex items-center gap-3">
            <Music className="w-6 h-6 text-amber-400" />
            <div>
              <span className="font-['Titan_One'] text-white text-base">MÚSICA ARCADE (BGM)</span>
              <p className="text-xs text-slate-400">Trilha procedural e animada com sintetizador Web Audio</p>
            </div>
          </div>
          <button
            onClick={toggleMusic}
            className={`w-14 h-8 rounded-full p-1 transition cursor-pointer ${
              save.settings.music ? 'bg-emerald-500' : 'bg-slate-700'
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full bg-white transition transform ${
                save.settings.music ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Vibration / Haptic */}
        <div className="flex items-center justify-between p-4 bg-slate-900/80 rounded-2xl border border-slate-700">
          <div className="flex items-center gap-3">
            <Vibrate className="w-6 h-6 text-red-400" />
            <div>
              <span className="font-['Titan_One'] text-white text-base">VIBRAÇÃO TÁTIL</span>
              <p className="text-xs text-slate-400">Feedback de colisão e impacto no dispositivo móvel</p>
            </div>
          </div>
          <button
            onClick={toggleVibration}
            className={`w-14 h-8 rounded-full p-1 transition cursor-pointer ${
              save.settings.vibration ? 'bg-emerald-500' : 'bg-slate-700'
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full bg-white transition transform ${
                save.settings.vibration ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Mobile Device Frame Toggle */}
        <div className="flex items-center justify-between p-4 bg-slate-900/80 rounded-2xl border border-slate-700">
          <div className="flex items-center gap-3">
            <Smartphone className="w-6 h-6 text-purple-400" />
            <div>
              <span className="font-['Titan_One'] text-white text-base">MOLDURA DE DISPOSITIVO MÓVEL</span>
              <p className="text-xs text-slate-400">Simulador de tela horizontal de smartphone no desktop</p>
            </div>
          </div>
          <button
            onClick={onToggleFrame}
            className={`w-14 h-8 rounded-full p-1 transition cursor-pointer ${
              showFrame ? 'bg-emerald-500' : 'bg-slate-700'
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full bg-white transition transform ${
                showFrame ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Sprites Manager Shortcut */}
        {onOpenSpritesDebug && (
          <div className="flex items-center justify-between p-4 bg-slate-900/80 rounded-2xl border border-sky-500/40">
            <div className="flex items-center gap-3">
              <Layers className="w-6 h-6 text-sky-400" />
              <div>
                <span className="font-['Titan_One'] text-sky-300 text-base">GERENCIADOR DE SPRITES</span>
                <p className="text-xs text-slate-400">Visualizar status de cada SpriteId individual (1 PNG = 1 Sprite)</p>
              </div>
            </div>
            <button
              onClick={() => {
                audioManager.playClick();
                onOpenSpritesDebug();
              }}
              className="px-3 py-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-['Titan_One'] text-xs rounded-xl active:scale-95 transition shadow cursor-pointer"
            >
              VER SPRITES
            </button>
          </div>
        )}

        {/* Reset Data */}
        <div className="flex items-center justify-between p-4 bg-red-950/30 rounded-2xl border border-red-900/50 mt-4">
          <div className="flex items-center gap-3">
            <Trash2 className="w-6 h-6 text-red-500" />
            <div>
              <span className="font-['Titan_One'] text-red-400 text-base">REINICIAR PROGRESSO</span>
              <p className="text-xs text-red-400/70">Apagar todos os recordes, moedas e heróis desbloqueados</p>
            </div>
          </div>
          <button
            onClick={() => {
              if (window.confirm('Tem certeza que deseja reiniciar todo o progresso do jogo?')) {
                onResetData();
              }
            }}
            className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white font-['Titan_One'] text-xs rounded-xl active:scale-95 transition cursor-pointer"
          >
            REINICIAR
          </button>
        </div>
      </div>

      <div className="text-center text-[11px] text-slate-500 mt-2">
        SMASH TRIP • Versão 1.0.0 Arcade • Criado para Desktop e Mobile Landscape
      </div>
    </div>
  );
};
