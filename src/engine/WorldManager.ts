import {
  CharacterId,
  WeaponId,
  BoosterEntity,
  CollectibleEntity,
  SceneryEntity,
  BiomeId,
  BiomeDef,
  Particle,
  ComicFX
} from '../types';

export const BIOMES: Record<BiomeId, BiomeDef> = {
  campo: {
    id: 'campo',
    name: 'Campo & Lago',
    startDistance: 0,
    endDistance: 2000,
    skyColorTop: '#38bdf8',
    skyColorBottom: '#bae6fd',
    groundColor: '#22c55e',
    groundSubColor: '#15803d',
    accentColor: '#fbbf24',
    particleColor: '#86efac',
  },
  montanhas: {
    id: 'montanhas',
    name: 'Montanhas Alpinas',
    startDistance: 2000,
    endDistance: 5000,
    skyColorTop: '#0284c7',
    skyColorBottom: '#7dd3fc',
    groundColor: '#16a34a',
    groundSubColor: '#475569',
    accentColor: '#38bdf8',
    particleColor: '#cbd5e1',
  },
  cidade: {
    id: 'cidade',
    name: 'Metrópole Neon',
    startDistance: 5000,
    endDistance: 10000,
    skyColorTop: '#1e3a8a',
    skyColorBottom: '#60a5fa',
    groundColor: '#334155',
    groundSubColor: '#1e293b',
    accentColor: '#38bdf8',
    particleColor: '#93c5fd',
  },
  deserto: {
    id: 'deserto',
    name: 'Cânions de Rocha',
    startDistance: 10000,
    endDistance: 20000,
    skyColorTop: '#ea580c',
    skyColorBottom: '#fde047',
    groundColor: '#d97706',
    groundSubColor: '#b45309',
    accentColor: '#f97316',
    particleColor: '#fde68a',
  },
  industrial: {
    id: 'industrial',
    name: 'Distrito Industrial',
    startDistance: 20000,
    endDistance: 30000,
    skyColorTop: '#9a3412',
    skyColorBottom: '#f97316',
    groundColor: '#475569',
    groundSubColor: '#334155',
    accentColor: '#ef4444',
    particleColor: '#fed7aa',
  },
  alien: {
    id: 'alien',
    name: 'Planeta Cristalino',
    startDistance: 30000,
    endDistance: 50000,
    skyColorTop: '#3b0764',
    skyColorBottom: '#7e22ce',
    groundColor: '#6b21a8',
    groundSubColor: '#4c1d95',
    accentColor: '#e879f9',
    particleColor: '#f0abfc',
  },
  espaco: {
    id: 'espaco',
    name: 'Órbita Cósmica',
    startDistance: 50000,
    endDistance: 1000000,
    skyColorTop: '#030712',
    skyColorBottom: '#1e1b4b',
    groundColor: '#111827',
    groundSubColor: '#030712',
    accentColor: '#60a5fa',
    particleColor: '#93c5fd',
  },
};

export class WorldManager {
  public boosters: BoosterEntity[] = [];
  public collectibles: CollectibleEntity[] = [];
  public sceneries: SceneryEntity[] = [];
  public generatedUpToX = 0;

  constructor() {
    this.reset();
  }

  public reset() {
    this.boosters = [];
    this.collectibles = [];
    this.sceneries = [];
    this.generatedUpToX = 0;
    // Initial generation (first 1000m)
    this.generateChunk(0, 1000);
  }

  public updateWorld(currentX: number) {
    if (currentX + 800 > this.generatedUpToX) {
      const nextChunkEnd = this.generatedUpToX + 1500;
      this.generateChunk(this.generatedUpToX, nextChunkEnd);
    }
  }

  public getCurrentBiome(x: number): BiomeDef {
    if (x < 2000) return BIOMES.campo;
    if (x < 5000) return BIOMES.montanhas;
    if (x < 10000) return BIOMES.cidade;
    if (x < 20000) return BIOMES.deserto;
    if (x < 30000) return BIOMES.industrial;
    if (x < 50000) return BIOMES.alien;
    return BIOMES.espaco;
  }

  private generateChunk(fromX: number, toX: number) {
    // Keep first 120m completely free of boosters as requested by design rule #16
    const minSafeX = Math.max(fromX, 130);

    let nextBoosterX = minSafeX + 30 + Math.random() * 40;
    while (nextBoosterX < toX) {
      // Pick booster type weighted by distance/altitude
      const rand = Math.random();
      let type: BoosterEntity['type'] = 'trampoline';
      let y = 0; // Ground booster by default
      let width = 3.8;
      let height = 3.2;

      if (rand < 0.22) {
        type = 'trampoline';
        y = 0;
        width = 3.6;
        height = 2.8;
      } else if (rand < 0.38) {
        type = 'spring';
        y = 0;
        width = 2.8;
        height = 3.0;
      } else if (rand < 0.52) {
        type = 'cannon';
        y = 0;
        width = 4.2;
        height = 3.8;
      } else if (rand < 0.66) {
        type = 'boxer';
        y = 0;
        width = 3.8;
        height = 4.8;
      } else if (rand < 0.78) {
        type = 'platform';
        y = 0;
        width = 5.2;
        height = 2.2;
      } else if (rand < 0.86) {
        type = 'balloon';
        y = 12 + Math.random() * 28; // Mid-air balloon
        width = 3.5;
        height = 4.6;
      } else if (rand < 0.93) {
        type = 'drone';
        y = 8 + Math.random() * 22; // Air drone
        width = 3.2;
        height = 2.6;
      } else {
        type = 'thrust_tower';
        y = 0;
        width = 4.0;
        height = 6.5;
      }

      this.boosters.push({
        id: `booster_${nextBoosterX.toFixed(1)}_${Math.random()}`,
        type,
        x: nextBoosterX,
        y,
        width,
        height,
        activated: false,
        activeTimer: 0,
      });

      // Spacing between boosters (45m to 90m)
      nextBoosterX += 45 + Math.random() * 45;
    }

    // Spawn Collectibles (Coins, Gems, Stars)
    let nextCoinX = fromX + 25;
    while (nextCoinX < toX) {
      const isAirArc = Math.random() < 0.45;
      const altitude = isAirArc ? 6 + Math.random() * 32 : 1.5 + Math.random() * 4;

      const coinRand = Math.random();
      let type: CollectibleEntity['type'] = 'coin';
      let value = 10;

      if (coinRand > 0.92) {
        type = 'xp_star';
        value = 35;
      } else if (coinRand > 0.82) {
        type = 'gem_blue';
        value = 50;
      } else if (coinRand > 0.72) {
        type = 'gem_pink';
        value = 40;
      }

      // Group of 3-5 coins
      const count = type === 'coin' ? 3 + Math.floor(Math.random() * 3) : 1;
      for (let i = 0; i < count; i++) {
        this.collectibles.push({
          id: `col_${nextCoinX + i * 4}_${Math.random()}`,
          type,
          x: nextCoinX + i * 3.5,
          y: altitude + Math.sin(i * 0.6) * 1.5,
          value,
          collected: false,
          sparkleTime: Math.random() * Math.PI * 2,
        });
      }

      nextCoinX += 30 + Math.random() * 35;
    }

    // Spawn Scenery objects (Crates, trees, buildings, barriers)
    let nextSceneryX = fromX + 15;
    const sceneryTypes: SceneryEntity['type'][] = [
      'tree', 'crate', 'tire', 'cone', 'barrier', 'hay_bale', 'rock', 'satellite', 'lamp', 'building', 'tank', 'fence'
    ];

    while (nextSceneryX < toX) {
      const type = sceneryTypes[Math.floor(Math.random() * sceneryTypes.length)];
      this.sceneries.push({
        id: `scenery_${nextSceneryX}_${Math.random()}`,
        type,
        x: nextSceneryX,
        y: 0,
        scale: 0.85 + Math.random() * 0.35,
      });

      nextSceneryX += 18 + Math.random() * 25;
    }

    this.generatedUpToX = toX;
  }
}
