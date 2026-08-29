import React, { useEffect, useRef, useState } from 'react';
import { GameEngine } from '../engine/GameEngine';
import { PlayerSaveData, FlightResult } from '../types';
import { Pause, Play, RotateCcw, Home, Zap, ArrowLeft, ArrowRight, Flame } from 'lucide-react';
import { audioManager } from '../services/audio';

interface GameScreenProps {
  save: PlayerSaveData;
  onFinishFlight: (result: FlightResult) => void;
  onExitToMenu: () => void;
}

export const GameScreen: React.FC<GameScreenProps> = ({ save, onFinishFlight, onExitToMenu }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);

  const [phase, setPhase] = useState<string>('PREPARING');
  const [distance, setDistance] = useState(0);
  const [altitude, setAltitude] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [combo, setCombo] = useState(1);
  const [biomeName, setBiomeName] = useState('Campo & Lago');
  const [powerSmashAvailable, setPowerSmashAvailable] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [showHitDebug, setShowHitDebug] = useState(false);

  // Meter states for UI
  const [angleVal, setAngleVal] = useState(45);
  const [powerVal, setPowerVal] = useState(50);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set high-res canvas buffer
    const updateCanvasSize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      if (engineRef.current && engineRef.current.renderer) {
        engineRef.current.renderer.setDimensions(canvas.width, canvas.height);
      }
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    // Initialize Game Engine
    const engine = new GameEngine(save);
    engineRef.current = engine;
    engine.onFlightFinished = onFinishFlight;
    engine.init(canvas);
    engine.startLoop();

    // UI Sync interval
    const uiInterval = setInterval(() => {
      if (!engineRef.current) return;
      setPhase(engineRef.current.phase);
      setDistance(Math.floor(engineRef.current.currentDistance));
      setAltitude(Math.floor(engineRef.current.currentAltitude));
      setSpeed(Math.floor(engineRef.current.currentSpeedKmh));
      setCombo(engineRef.current.currentCombo);
      setPowerSmashAvailable(engineRef.current.powerSmashAvailable);
      setAngleVal(Math.floor(engineRef.current.angleDegrees));
      setPowerVal(Math.floor(engineRef.current.powerPercent));

      const b = engineRef.current.world.getCurrentBiome(engineRef.current.dummyX);
      setBiomeName(b.name);
    }, 40);

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      clearInterval(uiInterval);
      engine.stopLoop();
    };
  }, [save, onFinishFlight]);

  // Tap handler for launch phases
  const handleScreenTouch = () => {
    if (isPaused || !engineRef.current) return;
    if (phase === 'PREPARING' || phase === 'ANGLE_SELECTION' || phase === 'POWER_SELECTION') {
      engineRef.current.handleTap();
    }
  };

  const togglePause = () => {
    if (!engineRef.current) return;
    audioManager.playClick();
    if (!isPaused) {
      engineRef.current.phase = 'PAUSED';
      setIsPaused(true);
    } else {
      engineRef.current.phase = 'FLYING';
      setIsPaused(false);
    }
  };

  const handleRestart = () => {
    audioManager.playClick();
    setIsPaused(false);
    if (engineRef.current) {
      engineRef.current.resetRun();
    }
  };

  const handlePowerSmash = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    if (engineRef.current) {
      engineRef.current.triggerPowerSmash();
    }
  };

  const isFlyingState = phase === 'FLYING' || phase === 'GROUND_BOUNCE' || phase === 'ROLLING';

  return (
    <div
      onClick={handleScreenTouch}
      className="relative w-full h-full overflow-hidden select-none bg-slate-950 touch-none flex flex-col justify-between"
    >
      {/* 60FPS High Performance Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block cursor-pointer"
      />

      {/* --- HUD OVERLAY (TOP BAR) --- */}
      <div className="relative z-20 w-full flex items-center justify-between p-3 sm:p-5 pointer-events-none">
        {/* Distance & Altitude */}
        <div className="flex items-center gap-2 sm:gap-4 pointer-events-auto">
          {/* Distance */}
          <div className="bg-slate-900/90 backdrop-blur-md px-3 sm:px-4 py-1.5 rounded-2xl border-2 border-yellow-400 shadow-xl flex flex-col">
            <span className="text-[9px] sm:text-[10px] font-black uppercase text-amber-400 leading-none">
              DISTÂNCIA
            </span>
            <span className="font-['Titan_One'] text-xl sm:text-2xl text-white tracking-wider">
              {distance.toLocaleString()} <span className="text-sm text-yellow-300">m</span>
            </span>
          </div>

          {/* Altitude */}
          <div className="bg-slate-900/90 backdrop-blur-md px-3 sm:px-4 py-1.5 rounded-2xl border-2 border-sky-400 shadow-xl flex flex-col">
            <span className="text-[9px] sm:text-[10px] font-black uppercase text-sky-400 leading-none">
              ALTURA
            </span>
            <span className="font-['Titan_One'] text-lg sm:text-xl text-white tracking-wider">
              {altitude.toLocaleString()} <span className="text-sm text-sky-300">m</span>
            </span>
          </div>

          {/* Speed */}
          <div className="bg-slate-900/90 backdrop-blur-md px-3 sm:px-4 py-1.5 rounded-2xl border-2 border-red-500 shadow-xl flex flex-col">
            <span className="text-[9px] sm:text-[10px] font-black uppercase text-red-400 leading-none">
              VELOCIDADE
            </span>
            <span className="font-['Titan_One'] text-lg sm:text-xl text-white tracking-wider">
              {speed} <span className="text-sm text-red-300">km/h</span>
            </span>
          </div>
        </div>

        {/* Combo & Biome & Pause Button */}
        <div className="flex items-center gap-2 sm:gap-3 pointer-events-auto">
          {/* Combo Multiplier Badge */}
          {combo > 1 && (
            <div className="bg-gradient-to-r from-red-600 to-amber-500 px-3 py-1.5 rounded-2xl border-2 border-yellow-300 shadow-xl flex items-center gap-1.5 animate-bounce">
              <Flame className="w-5 h-5 text-yellow-200 fill-yellow-300" />
              <span className="font-['Titan_One'] text-lg sm:text-xl text-white tracking-wider">
                x{combo}!
              </span>
            </div>
          )}

          {/* Biome Badge */}
          <div className="hidden sm:flex bg-slate-900/80 backdrop-blur px-3 py-1.5 rounded-xl border border-slate-700 text-xs font-black text-slate-300">
            {biomeName}
          </div>

          {/* Hitbox Debug Toggle */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              const next = !showHitDebug;
              setShowHitDebug(next);
              if (engineRef.current) engineRef.current.showHitDebug = next;
            }}
            className={`px-2.5 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-wider transition ${
              showHitDebug
                ? 'bg-amber-500/90 border-yellow-300 text-slate-950 font-bold shadow-[0_0_15px_rgba(245,158,11,0.5)]'
                : 'bg-slate-900/80 border-slate-700 text-slate-400 hover:text-white'
            }`}
            title="Toggle Hitbox & Anchor Debug Lines"
          >
            DEBUG
          </button>

          {/* Pause Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              togglePause();
            }}
            className="p-2.5 bg-slate-900/90 hover:bg-slate-800 border-2 border-slate-600 rounded-2xl text-white active:scale-95 transition shadow-xl"
          >
            {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* --- PREPARING / ANGLE / POWER MODAL OVERLAYS --- */}
      <div className="relative z-20 flex-1 flex flex-col items-center justify-center pointer-events-none p-4">
        {phase === 'PREPARING' && (
          <div className="bg-slate-950/85 backdrop-blur-md px-6 py-4 rounded-3xl border-4 border-yellow-400 shadow-2xl flex flex-col items-center animate-pulse">
            <span className="font-['Titan_One'] text-2xl sm:text-4xl text-yellow-300 drop-shadow-md text-center">
              PREPARE O GOLPE!
            </span>
            <span className="text-xs sm:text-sm font-bold text-white mt-1 uppercase tracking-widest font-['Fredoka']">
              Toque na tela para iniciar
            </span>
          </div>
        )}

        {phase === 'ANGLE_SELECTION' && (
          <div className="bg-slate-950/90 backdrop-blur-md px-6 py-4 rounded-3xl border-4 border-sky-400 shadow-2xl flex flex-col items-center max-w-sm w-full">
            <span className="font-['Titan_One'] text-xl sm:text-2xl text-sky-300">
              DEFINA O ÂNGULO: {angleVal}°
            </span>
            <div className="w-full h-4 bg-slate-800 rounded-full overflow-hidden border-2 border-sky-500 mt-2 relative">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-sky-500 transition-all duration-75"
                style={{ width: `${((angleVal - 15) / 45) * 100}%` }}
              />
            </div>
            <span className="text-xs font-bold text-sky-200 mt-2 uppercase tracking-wide">
              TOQUE PARA TRAVAR O ÂNGULO
            </span>
          </div>
        )}

        {phase === 'POWER_SELECTION' && (
          <div className="bg-slate-950/90 backdrop-blur-md px-6 py-4 rounded-3xl border-4 border-red-500 shadow-2xl flex flex-col items-center max-w-md w-full">
            <div className="flex items-center justify-between w-full">
              <span className="font-['Titan_One'] text-xl sm:text-2xl text-red-400">
                FORÇA: {powerVal}%
              </span>
              <span className="text-[10px] sm:text-xs font-black px-2 py-0.5 rounded bg-yellow-400 text-slate-950 uppercase font-['Titan_One']">
                ZONA PERFECT (94-100%)
              </span>
            </div>
            {/* Power Gauge with Golden Perfect Area */}
            <div className="w-full h-6 bg-slate-800 rounded-full overflow-hidden border-2 border-red-500 mt-2 relative">
              {/* Golden Perfect Zone marker */}
              <div className="absolute right-0 top-0 bottom-0 w-[10%] bg-amber-400/40 border-l-2 border-yellow-300 z-10 flex items-center justify-center text-[9px] font-black text-amber-300">
                ★
              </div>
              <div
                className="h-full bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 transition-all duration-75"
                style={{ width: `${powerVal}%` }}
              />
            </div>
            <span className="text-xs font-bold text-red-200 mt-2 uppercase tracking-wide">
              TOQUE PARA TRAVAR A FORÇA!
            </span>
          </div>
        )}
      </div>

      {/* --- IN-FLIGHT BOTTOM CONTROLS & POWER SMASH --- */}
      {isFlyingState && (
        <div className="relative z-20 w-full flex items-end justify-between p-3 sm:p-5 pointer-events-none">
          {/* Left In-Flight Aerial Steering Touch Zones */}
          <div className="flex items-center gap-3 pointer-events-auto">
            {/* Tilt Back Button */}
            <button
              onMouseDown={() => engineRef.current?.setSteering('left')}
              onMouseUp={() => engineRef.current?.setSteering('none')}
              onTouchStart={() => engineRef.current?.setSteering('left')}
              onTouchEnd={() => engineRef.current?.setSteering('none')}
              className="flex flex-col items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-slate-900/85 hover:bg-slate-800 border-2 border-sky-400 rounded-2xl text-sky-300 font-bold active:scale-95 transition shadow-2xl"
            >
              <ArrowLeft className="w-6 h-6 sm:w-8 sm:h-8" />
              <span className="text-[9px] font-black uppercase font-['Titan_One']">PLANAR</span>
            </button>

            {/* Dive Button */}
            <button
              onMouseDown={() => engineRef.current?.setSteering('right')}
              onMouseUp={() => engineRef.current?.setSteering('none')}
              onTouchStart={() => engineRef.current?.setSteering('right')}
              onTouchEnd={() => engineRef.current?.setSteering('none')}
              className="flex flex-col items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-slate-900/85 hover:bg-slate-800 border-2 border-orange-400 rounded-2xl text-orange-300 font-bold active:scale-95 transition shadow-2xl"
            >
              <ArrowRight className="w-6 h-6 sm:w-8 sm:h-8" />
              <span className="text-[9px] font-black uppercase font-['Titan_One']">MERGULHO</span>
            </button>
          </div>

          {/* Right POWER SMASH Button */}
          <div className="pointer-events-auto">
            <button
              disabled={!powerSmashAvailable}
              onClick={handlePowerSmash}
              className={`relative flex flex-col items-center justify-center w-20 h-20 sm:w-28 sm:h-28 rounded-full p-2 border-4 transition duration-200 shadow-2xl ${
                powerSmashAvailable
                  ? 'bg-gradient-to-b from-red-500 via-rose-600 to-red-800 border-yellow-300 text-white animate-pulse hover:scale-105 active:scale-95 shadow-[0_0_35px_rgba(239,68,68,0.7)]'
                  : 'bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed opacity-50'
              }`}
            >
              <Zap className="w-8 h-8 sm:w-12 sm:h-12 fill-current" />
              <span className="font-['Titan_One'] text-[11px] sm:text-xs tracking-wider uppercase">
                {powerSmashAvailable ? 'POWER SMASH' : 'USADO'}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* --- PAUSE MODAL --- */}
      {isPaused && (
        <div className="absolute inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 p-6 rounded-3xl border-4 border-slate-700 shadow-2xl flex flex-col items-center max-w-xs w-full">
            <span className="font-['Titan_One'] text-3xl text-white mb-4">JOGO PAUSADO</span>
            <div className="flex flex-col gap-3 w-full">
              <button
                onClick={togglePause}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-['Titan_One'] rounded-xl flex items-center justify-center gap-2 active:scale-95 transition"
              >
                <Play className="w-5 h-5" /> CONTINUAR
              </button>
              <button
                onClick={handleRestart}
                className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-['Titan_One'] rounded-xl flex items-center justify-center gap-2 active:scale-95 transition"
              >
                <RotateCcw className="w-5 h-5" /> REINICIAR
              </button>
              <button
                onClick={() => {
                  audioManager.playClick();
                  onExitToMenu();
                }}
                className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-['Titan_One'] rounded-xl flex items-center justify-center gap-2 active:scale-95 transition"
              >
                <Home className="w-5 h-5" /> MENU PRINCIPAL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
