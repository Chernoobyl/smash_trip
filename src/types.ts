export type GameScreenState = 
  | 'MAIN_MENU'
  | 'GAMEPLAY'
  | 'HEROES'
  | 'UPGRADES'
  | 'SHOP'
  | 'ACHIEVEMENTS'
  | 'SETTINGS'
  | 'ASSET_DEBUG';

export type GameplayPhase =
  | 'PREPARING'
  | 'ANGLE_SELECTION'
  | 'POWER_SELECTION'
  | 'SWING'
  | 'LAUNCH'
  | 'FLYING'
  | 'GROUND_BOUNCE'
  | 'ROLLING'
  | 'STOPPED'
  | 'RESULT'
  | 'PAUSED';

export type CharacterId = 'brutus' | 'nika' | 'volt';

export interface CharacterStats {
  power: number;      // e.g. Brutus: 8, Nika: 5, Volt: 6
  precision: number;  // e.g. Brutus: 4, Nika: 8, Volt: 6
  control: number;    // e.g. Brutus: 5, Nika: 6, Volt: 8
}

export interface CharacterDef {
  id: CharacterId;
  name: string;
  title: string;
  description: string;
  baseStats: CharacterStats;
  unlockDistanceMeters: number; // 0 for Brutus, 2000 for Nika, 5000 for Volt
  primaryColor: string;
  accentColor: string;
}

export type WeaponId = 
  | 'base_bat'
  | 'mega_hammer'
  | 'cyber_bat'
  | 'power_guitar'
  | 'titan_mallet'
  | 'energy_club';

export interface WeaponDef {
  id: WeaponId;
  name: string;
  price: number;
  bonusPower: number;
  bonusPrecision: number;
  bonusControl: number;
  description: string;
  glowColor: string;
}

export type EquipmentCategory = 'helmets' | 'armors' | 'accessories';

export interface EquipmentDef {
  id: string;
  category: EquipmentCategory;
  name: string;
  price: number;
  bonusPower: number;
  bonusPrecision: number;
  bonusControl: number;
  description: string;
  iconType: string;
}

export type BoosterType =
  | 'trampoline'
  | 'cannon'
  | 'boxer'
  | 'spring'
  | 'turbine'
  | 'drone'
  | 'big_fan'
  | 'platform'
  | 'balloon'
  | 'thrust_tower';

export interface BoosterEntity {
  id: string;
  type: BoosterType;
  x: number; // in meters (world space)
  y: number; // in meters (0 is ground, positive is in air)
  width: number;
  height: number;
  activated: boolean;
  activeTimer: number;
  customData?: any;
}

export interface CollectibleEntity {
  id: string;
  type: 'coin' | 'gem_blue' | 'gem_pink' | 'gem_green' | 'xp_star';
  x: number;
  y: number;
  value: number;
  collected: boolean;
  sparkleTime: number;
}

export interface SceneryEntity {
  id: string;
  type: 'crate' | 'tire' | 'cone' | 'barrier' | 'hay_bale' | 'rock' | 'satellite' | 'lamp' | 'tree' | 'building' | 'tank' | 'fence';
  x: number;
  y: number;
  scale: number;
}

export type BiomeId = 
  | 'campo'
  | 'montanhas'
  | 'cidade'
  | 'deserto'
  | 'industrial'
  | 'alien'
  | 'espaco';

export interface BiomeDef {
  id: BiomeId;
  name: string;
  startDistance: number; // in meters
  endDistance: number;
  skyColorTop: string;
  skyColorBottom: string;
  groundColor: string;
  groundSubColor: string;
  accentColor: string;
  particleColor: string;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  alpha: number;
  type: 'dust' | 'spark' | 'smoke' | 'energy' | 'star' | 'coin_glint' | 'shockwave';
  rotation?: number;
  rotSpeed?: number;
}

export interface ComicFX {
  x: number;
  y: number;
  text: 'POW!' | 'BAM!' | 'KRAK!' | 'BOOM!' | 'SMASH!' | 'PERFECT!';
  life: number;
  maxLife: number;
  scale: number;
  rotation: number;
  color: string;
}

export interface PlayerSaveData {
  coins: number;
  xp: number;
  level: number;
  statPoints: number;
  upgrades: {
    power: number;
    precision: number;
    control: number;
  };
  selectedCharacter: CharacterId;
  unlockedCharacters: CharacterId[];
  selectedWeapon: WeaponId;
  ownedWeapons: WeaponId[];
  equippedHelmet: string | null;
  equippedArmor: string | null;
  equippedAccessory: string | null;
  ownedEquipment: string[];
  bestDistance: number;
  maxAltitudeRecord: number;
  maxSpeedRecord: number;
  totalFlights: number;
  totalSmashHits: number;
  tutorialCompleted: boolean;
  unlockedAchievements: string[];
  settings: {
    music: boolean;
    sfx: boolean;
    vibration: boolean;
    showFrame: boolean;
  };
}

export interface FlightResult {
  distance: number;
  maxAltitude: number;
  maxSpeed: number;
  maxCombo: number;
  boostersHit: number;
  coinsEarned: number;
  xpEarned: number;
  isNewRecord: boolean;
  levelUp: boolean;
  unlockedHero?: string;
}

export interface AchievementDef {
  id: string;
  title: string;
  description: string;
  rewardCoins: number;
  rewardXp: number;
  icon: string;
  check: (save: PlayerSaveData, result?: FlightResult) => boolean;
}
