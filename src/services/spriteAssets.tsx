import React, { useState, useEffect } from 'react';
import { SpriteId, SPRITE_MANIFEST } from '../assets';

// In-Memory Image Cache (1 SpriteId -> 1 HTMLImageElement)
const imageCache: Map<SpriteId, HTMLImageElement> = new Map();
const loadStatus: Map<SpriteId, 'LOADING' | 'READY' | 'MISSING'> = new Map();
const listeners: Set<() => void> = new Set();

function notifyListeners() {
  listeners.forEach((l) => l());
}

/**
 * Clear any old asset caches or stale asset keys from localStorage
 * (Preserves player save data completely)
 */
export function clearAssetCache() {
  imageCache.clear();
  loadStatus.clear();

  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (
        key &&
        (key.startsWith('smashtrip_asset_') ||
          key.startsWith('smashtrip_sprite_') ||
          key.startsWith('smashtrip_atlas_') ||
          key.startsWith('custom_sprites_'))
      ) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
  } catch (e) {
    // Ignore storage errors
  }
}

// Auto run cache cleanup on module load
clearAssetCache();

/**
 * Request image for a SpriteId
 */
export function getSpriteImage(spriteId: SpriteId): HTMLImageElement | null {
  if (!spriteId || !SPRITE_MANIFEST[spriteId]) return null;

  const cached = imageCache.get(spriteId);
  if (cached) {
    if (cached.complete && cached.naturalWidth > 0) {
      return cached;
    }
    return null;
  }

  const manifest = SPRITE_MANIFEST[spriteId];
  if (!manifest || !manifest.filePath) {
    loadStatus.set(spriteId, 'MISSING');
    return null;
  }

  const img = new Image();
  loadStatus.set(spriteId, 'LOADING');

  img.onload = () => {
    loadStatus.set(spriteId, 'READY');
    notifyListeners();
  };

  img.onerror = () => {
    loadStatus.set(spriteId, 'MISSING');
    notifyListeners();
  };

  img.src = manifest.filePath;
  imageCache.set(spriteId, img);

  return null;
}

/**
 * Returns current asset load status for a SpriteId: 'READY' | 'LOADING' | 'MISSING'
 */
export function getSpriteStatus(spriteId: SpriteId): 'READY' | 'LOADING' | 'MISSING' {
  if (loadStatus.has(spriteId)) {
    return loadStatus.get(spriteId)!;
  }
  // Trigger fetch
  getSpriteImage(spriteId);
  return loadStatus.get(spriteId) || 'MISSING';
}

export interface DrawSpriteOptions {
  width?: number;
  height?: number;
  scale?: number;
  rotation?: number;
  alpha?: number;
  pivotX?: number; // 0 to 1 (default 0.5)
  pivotY?: number; // 0 to 1 (default 0.5)
  flipX?: boolean;
}

/**
 * Direct Canvas 2D Sprite Renderer (1 PNG = 1 Sprite)
 * If the asset is missing, renders "MISSING ASSET: <SpriteId>"
 */
export function drawSprite(
  ctx: CanvasRenderingContext2D,
  spriteId: SpriteId,
  x: number,
  y: number,
  options: DrawSpriteOptions = {}
) {
  const {
    width,
    height,
    scale = 1.0,
    rotation = 0,
    alpha = 1.0,
    pivotX = 0.5,
    pivotY = 0.5,
    flipX = false,
  } = options;

  const img = getSpriteImage(spriteId);

  ctx.save();
  ctx.translate(x, y);

  if (rotation !== 0) {
    ctx.rotate(rotation);
  }

  if (flipX) {
    ctx.scale(-1, 1);
  }

  if (alpha < 1.0) {
    ctx.globalAlpha *= Math.max(0, Math.min(1, alpha));
  }

  if (img && img.complete && img.naturalWidth > 0) {
    const drawW = (width || img.naturalWidth) * scale;
    const drawH = (height || img.naturalHeight) * scale;
    const drawX = -drawW * pivotX;
    const drawY = -drawH * pivotY;

    // Full 1-to-1 individual PNG draw (no crop, no source rect)
    ctx.drawImage(img, drawX, drawY, drawW, drawH);
  } else {
    // Missing Asset Placeholder Box
    const boxW = (width || 120) * scale;
    const boxH = (height || 50) * scale;
    const boxX = -boxW * pivotX;
    const boxY = -boxH * pivotY;

    ctx.fillStyle = 'rgba(239, 68, 68, 0.25)'; // Red tint
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(boxX, boxY, boxW, boxH, 4);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#f87171';
    ctx.font = `bold ${Math.max(9, Math.min(12, boxH * 0.35))}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`MISSING: ${spriteId}`, 0, 0);
  }

  ctx.restore();
}

/**
 * React Component for UI Sprite Images
 * If the image fails to load or does not exist, displays a clean MISSING badge.
 */
export const SpriteImage: React.FC<{
  spriteId: SpriteId;
  className?: string;
  alt?: string;
}> = ({ spriteId, className = 'w-full h-full object-contain', alt }) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const manifest = SPRITE_MANIFEST[spriteId];
  const src = manifest?.filePath || '';

  useEffect(() => {
    setHasError(false);
    setIsLoaded(false);
  }, [spriteId]);

  if (hasError || !src) {
    return (
      <div className={`flex flex-col items-center justify-center bg-red-950/40 border border-red-500/50 rounded-lg p-1 text-center select-none ${className}`}>
        <span className="text-[9px] font-mono font-bold text-red-400 leading-tight">
          MISSING ASSET:
        </span>
        <span className="text-[10px] font-mono font-black text-red-200 truncate max-w-full px-1">
          {spriteId}
        </span>
      </div>
    );
  }

  return (
    <div className={`relative flex items-center justify-center overflow-hidden ${className}`}>
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/60 rounded border border-slate-700/50">
          <span className="text-[9px] font-mono text-slate-400 animate-pulse">
            {spriteId}...
          </span>
        </div>
      )}
      <img
        src={src}
        alt={alt || spriteId}
        className={`${className} ${!isLoaded ? 'opacity-0' : 'opacity-100'} transition-opacity duration-150`}
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
      />
    </div>
  );
};
