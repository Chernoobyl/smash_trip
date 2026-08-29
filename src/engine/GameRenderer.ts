import {
  CharacterId,
  WeaponId,
  BoosterEntity,
  CollectibleEntity,
  SceneryEntity,
  BiomeDef,
  Particle,
  ComicFX,
} from '../types';
import { SpriteId } from '../assets';
import { drawSprite } from '../services/spriteAssets';

export class GameRenderer {
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;

  constructor(ctx: CanvasRenderingContext2D, width: number, height: number) {
    this.ctx = ctx;
    this.width = width;
    this.height = height;
  }

  public setDimensions(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  // --- BACKGROUND & PARALLAX ---

  public renderBackground(
    camX: number,
    camY: number,
    zoom: number,
    biome: BiomeDef
  ) {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    // Sky Background
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
    skyGrad.addColorStop(0, biome.skyColorTop);
    skyGrad.addColorStop(1, biome.skyColorBottom);
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h);

    // Map Biome to Background SpriteId
    let bgSpriteId: SpriteId = 'BG_FIELD';
    if (biome.id === 'montanhas') bgSpriteId = 'BG_MOUNTAINS';
    else if (biome.id === 'cidade' || biome.id === 'industrial') bgSpriteId = 'BG_CITY';
    else if (biome.id === 'deserto') bgSpriteId = 'BG_DESERT';
    else if (biome.id === 'espaco' || biome.id === 'alien') bgSpriteId = 'BG_SPACE';

    // Parallax background layer (0.2x speed)
    const parallaxOffset = (camX * 15) % w;
    for (let i = -1; i <= 2; i++) {
      const bgX = i * w - parallaxOffset + w * 0.5;
      drawSprite(ctx, bgSpriteId, bgX, h * 0.45, {
        width: w,
        height: h * 0.75,
        pivotX: 0.5,
        pivotY: 0.5,
        alpha: 0.85,
      });
    }
  }

  // --- GROUND RENDERING (PHYSICS BASELINE) ---

  public renderGround(
    camX: number,
    camY: number,
    zoom: number,
    worldToScreenY: (y: number) => number,
    biome: BiomeDef
  ) {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;
    const groundScreenY = worldToScreenY(0);

    // Main Ground Fill
    const groundGrad = ctx.createLinearGradient(0, groundScreenY, 0, h);
    groundGrad.addColorStop(0, biome.groundColor);
    groundGrad.addColorStop(0.15, biome.groundSubColor);
    groundGrad.addColorStop(1, '#0f172a');

    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, groundScreenY, w, Math.max(0, h - groundScreenY));

    // Ground Baseline Trim
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 0.3;
    ctx.fillRect(0, groundScreenY, w, 3);
    ctx.globalAlpha = 1.0;

    // Distance Markers on Ground every 50 meters
    ctx.font = `bold ${Math.max(11, 13 * zoom)}px 'Titan One', sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';

    const firstMarker = Math.floor((camX - 30) / 50) * 50;
    const lastMarker = Math.ceil((camX + w / (25 * zoom) + 30) / 50) * 50;

    for (let m = Math.max(0, firstMarker); m <= lastMarker; m += 50) {
      const screenX = (m - camX) * 25 * zoom + w * 0.25;
      if (screenX >= -100 && screenX <= w + 100) {
        // Line
        ctx.fillStyle = m % 100 === 0 ? '#facc15' : 'rgba(255, 255, 255, 0.5)';
        ctx.fillRect(screenX - 1.5, groundScreenY, 3, 24 * zoom);

        // Marker Pill
        ctx.fillStyle = m % 100 === 0 ? '#e11d48' : '#1e293b';
        ctx.beginPath();
        ctx.roundRect(screenX - 34 * zoom, groundScreenY + 6 * zoom, 68 * zoom, 20 * zoom, 5);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.fillText(`${m}m`, screenX, groundScreenY + 20 * zoom);
      }
    }
  }

  // --- SCENERY & PROPS RENDERING ---

  public renderScenery(
    sceneries: SceneryEntity[],
    camX: number,
    camY: number,
    zoom: number,
    worldToScreenX: (x: number) => number,
    worldToScreenY: (y: number) => number
  ) {
    const ctx = this.ctx;
    for (const sc of sceneries) {
      const sx = worldToScreenX(sc.x);
      const sy = worldToScreenY(sc.y);
      if (sx < -150 || sx > this.width + 150) continue;

      let spriteId: SpriteId = 'ENV_OBJECT_01';
      if (sc.type === 'tree') spriteId = 'ENV_OBJECT_01';
      else if (sc.type === 'crate') spriteId = 'ENV_OBJECT_02';
      else if (sc.type === 'tire') spriteId = 'ENV_OBJECT_03';
      else if (sc.type === 'cone' || sc.type === 'barrier') spriteId = 'ENV_OBJECT_04';
      else if (sc.type === 'rock') spriteId = 'ENV_OBJECT_05';
      else if (sc.type === 'lamp') spriteId = 'ENV_OBJECT_06';

      drawSprite(ctx, spriteId, sx, sy, {
        scale: zoom * sc.scale,
        width: 80,
        height: 80,
        pivotX: 0.5,
        pivotY: 1.0,
      });
    }
  }

  // --- BOOSTERS RENDERING ---

  public renderBoosters(
    boosters: BoosterEntity[],
    zoom: number,
    worldToScreenX: (x: number) => number,
    worldToScreenY: (y: number) => number
  ) {
    const ctx = this.ctx;
    for (const b of boosters) {
      const sx = worldToScreenX(b.x);
      const sy = worldToScreenY(b.y);
      if (sx < -150 || sx > this.width + 150) continue;

      let spriteId: SpriteId = 'BOOSTER_TRAMPOLINE';
      if (b.type === 'cannon') spriteId = 'BOOSTER_CANNON';
      else if (b.type === 'boxer') spriteId = 'BOOSTER_BOXER';
      else if (b.type === 'spring') spriteId = 'BOOSTER_SPRING';
      else if (b.type === 'turbine') spriteId = 'BOOSTER_TURBINE';
      else if (b.type === 'drone') spriteId = 'BOOSTER_DRONE';
      else if (b.type === 'big_fan') spriteId = 'BOOSTER_BIG_FAN';
      else if (b.type === 'platform') spriteId = 'BOOSTER_PLATFORM';
      else if (b.type === 'balloon') spriteId = 'BOOSTER_BALLOON';
      else if (b.type === 'thrust_tower') spriteId = 'BOOSTER_THRUST_TOWER';

      const animScale = b.activated ? 1.25 : 1.0;
      drawSprite(ctx, spriteId, sx, sy, {
        scale: zoom * animScale,
        width: 90,
        height: 90,
        pivotX: 0.5,
        pivotY: 1.0,
      });
    }
  }

  // --- COLLECTIBLES RENDERING ---

  public renderCollectibles(
    collectibles: CollectibleEntity[],
    zoom: number,
    worldToScreenX: (x: number) => number,
    worldToScreenY: (y: number) => number,
    gameTime: number
  ) {
    const ctx = this.ctx;
    for (const c of collectibles) {
      if (c.collected) continue;
      const sx = worldToScreenX(c.x);
      const sy = worldToScreenY(c.y);
      if (sx < -50 || sx > this.width + 50) continue;

      const bob = Math.sin(gameTime * 4 + c.sparkleTime) * 4;

      let spriteId: SpriteId = 'COIN_GOLD';
      if (c.type === 'gem_pink') spriteId = 'GEM_PINK';
      else if (c.type === 'gem_blue') spriteId = 'GEM_BLUE';
      else if (c.type === 'gem_green') spriteId = 'GEM_MAGENTA';
      else if (c.type === 'xp_star') spriteId = 'XP_STAR';

      drawSprite(ctx, spriteId, sx, sy + bob, {
        scale: zoom,
        width: 44,
        height: 44,
        pivotX: 0.5,
        pivotY: 0.5,
      });
    }
  }

  // --- CHARACTER (LAUNCHER) RENDERING ---

  public renderLauncher(
    charId: CharacterId,
    weaponId: WeaponId,
    state: 'idle' | 'prepare' | 'swing' | 'recovery',
    swingProgress: number,
    screenX: number,
    screenY: number,
    scale: number,
    showHitDebug = false
  ) {
    const ctx = this.ctx;

    // Map Hero SpriteId
    let heroSpriteId: SpriteId = 'BRUTUS_IDLE';
    if (charId === 'brutus') {
      if (state === 'prepare') heroSpriteId = 'BRUTUS_PREPARE';
      else if (state === 'swing') heroSpriteId = swingProgress < 0.5 ? 'BRUTUS_SWING_01' : 'BRUTUS_SWING_02';
      else if (state === 'recovery') heroSpriteId = 'BRUTUS_RECOVERY';
      else heroSpriteId = 'BRUTUS_IDLE';
    } else if (charId === 'nika') {
      if (state === 'prepare') heroSpriteId = 'NIKA_PREPARE';
      else if (state === 'swing') heroSpriteId = swingProgress < 0.5 ? 'NIKA_SWING_01' : 'NIKA_SWING';
      else if (state === 'recovery') heroSpriteId = 'NIKA_RECOVERY';
      else heroSpriteId = 'NIKA_IDLE';
    } else if (charId === 'volt') {
      if (state === 'prepare') heroSpriteId = 'VOLT_PREPARE';
      else if (state === 'swing') heroSpriteId = swingProgress < 0.5 ? 'VOLT_SWING_01' : 'VOLT_SWING';
      else if (state === 'recovery') heroSpriteId = 'VOLT_RECOVERY';
      else heroSpriteId = 'VOLT_IDLE';
    }

    // Shadow on ground
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(screenX, screenY, 44 * scale, 12 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    // Hero Sprite
    drawSprite(ctx, heroSpriteId, screenX, screenY, {
      scale: scale,
      width: 140,
      height: 160,
      pivotX: 0.5,
      pivotY: 1.0,
    });

    // Weapon Sprite
    if (state !== 'recovery') {
      let weaponSpriteId: SpriteId = 'WEAPON_BASE_BAT';
      if (weaponId === 'mega_hammer') weaponSpriteId = 'WEAPON_MEGA_HAMMER';
      else if (weaponId === 'cyber_bat') weaponSpriteId = 'WEAPON_CYBER_BAT';
      else if (weaponId === 'power_guitar') weaponSpriteId = 'WEAPON_POWER_GUITAR';
      else if (weaponId === 'titan_mallet') weaponSpriteId = 'WEAPON_TITAN_MALLET';
      else if (weaponId === 'energy_club') weaponSpriteId = 'WEAPON_ENERGY_CLUB';

      let handOffsetX = 24 * scale;
      let handOffsetY = -70 * scale;
      let weaponRot = 0.35;

      if (state === 'prepare') {
        handOffsetX = -24 * scale;
        handOffsetY = -85 * scale;
        weaponRot = -1.35;
      } else if (state === 'swing') {
        const ease = Math.pow(swingProgress, 2.0);
        handOffsetX = (-24 + ease * 60) * scale;
        handOffsetY = (-85 + Math.sin(swingProgress * Math.PI) * 20) * scale;
        weaponRot = -1.35 + ease * 2.2;
      }

      drawSprite(ctx, weaponSpriteId, screenX + handOffsetX, screenY + handOffsetY, {
        scale: scale * 0.8,
        width: 80,
        height: 80,
        rotation: weaponRot,
        pivotX: 0.2,
        pivotY: 0.8,
      });
    }
  }

  // --- DUMMY JACK RENDERING ---

  public renderDummyJack(
    state: 'idle' | 'hit' | 'flying' | 'spinning' | 'groundHit' | 'bounce' | 'rolling' | 'stopped',
    expression: 'happy' | 'shocked' | 'dizzy' | 'ko',
    screenX: number,
    screenY: number,
    rotation: number,
    scale: number,
    squashX = 1.0,
    squashY = 1.0,
    showHitDebug = false
  ) {
    const ctx = this.ctx;

    let dummySpriteId: SpriteId = 'DUMMY_IDLE';
    if (state === 'hit') dummySpriteId = 'DUMMY_HIT';
    else if (state === 'flying' || state === 'bounce') dummySpriteId = 'DUMMY_FLY';
    else if (state === 'spinning') dummySpriteId = 'DUMMY_SPIN';
    else if (state === 'groundHit') dummySpriteId = 'DUMMY_GROUND_HIT';
    else if (state === 'rolling') dummySpriteId = 'DUMMY_ROLL';
    else if (state === 'stopped') dummySpriteId = 'DUMMY_KO';

    // Shadow on ground
    if (state === 'idle' || state === 'stopped') {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.beginPath();
      ctx.ellipse(screenX, screenY + 6, 28 * scale, 8 * scale, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    drawSprite(ctx, dummySpriteId, screenX, screenY, {
      scale: scale,
      width: 100 * squashX,
      height: 120 * squashY,
      rotation: rotation,
      pivotX: 0.5,
      pivotY: 0.5,
    });
  }

  // --- PARTICLES & COMIC FX RENDERING ---

  public renderParticles(
    particles: Particle[],
    worldToScreenX: (x: number) => number,
    worldToScreenY: (y: number) => number,
    zoom: number
  ) {
    const ctx = this.ctx;
    for (const p of particles) {
      const sx = worldToScreenX(p.x);
      const sy = worldToScreenY(p.y);
      if (sx < -50 || sx > this.width + 50) continue;

      ctx.save();
      ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
      ctx.fillStyle = p.color;

      if (p.type === 'shockwave') {
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 4 * zoom;
        ctx.beginPath();
        ctx.arc(sx, sy, p.size * zoom, 0, Math.PI * 2);
        ctx.stroke();
      } else if (p.type === 'star') {
        ctx.translate(sx, sy);
        ctx.rotate(p.rotation || 0);
        ctx.beginPath();
        for (let i = 0; i < 4; i++) {
          ctx.lineTo(
            Math.cos((i * Math.PI) / 2) * p.size * zoom,
            Math.sin((i * Math.PI) / 2) * p.size * zoom
          );
          ctx.lineTo(
            Math.cos((i * Math.PI) / 2 + Math.PI / 4) * (p.size * 0.3) * zoom,
            Math.sin((i * Math.PI) / 2 + Math.PI / 4) * (p.size * 0.3) * zoom
          );
        }
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(sx, sy, p.size * zoom, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  public renderComicFX(
    comicList: ComicFX[],
    worldToScreenX: (x: number) => number,
    worldToScreenY: (y: number) => number
  ) {
    const ctx = this.ctx;
    for (const c of comicList) {
      const sx = worldToScreenX(c.x);
      const sy = worldToScreenY(c.y);

      const progress = 1 - c.life / c.maxLife;
      const popScale = c.scale * (progress < 0.2 ? progress / 0.2 : 1 + (1 - progress) * 0.2);

      let fxSpriteId: SpriteId = 'FX_POW';
      const upper = c.text.toUpperCase();
      if (upper.includes('BAM')) fxSpriteId = 'FX_BAM';
      else if (upper.includes('KRAK')) fxSpriteId = 'FX_KRAK';
      else if (upper.includes('BOOM')) fxSpriteId = 'FX_BOOM';
      else if (upper.includes('SMASH') || upper.includes('PERFECT')) fxSpriteId = 'FX_SMASH';

      drawSprite(ctx, fxSpriteId, sx, sy, {
        scale: popScale * 0.8,
        width: 140,
        height: 100,
        rotation: c.rotation,
        pivotX: 0.5,
        pivotY: 0.5,
      });
    }
  }

  // --- SPEED LINES ---

  public renderSpeedLines(speedRatio: number) {
    if (speedRatio < 0.35) return;
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 2.5;

    const count = Math.floor(speedRatio * 18);
    for (let i = 0; i < count; i++) {
      const y = Math.random() * h;
      const len = 80 + Math.random() * 200;
      const x = Math.random() * w;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - len, y);
      ctx.stroke();
    }
    ctx.restore();
  }
}
