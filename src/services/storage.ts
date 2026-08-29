import {
  CharacterDef,
  CharacterId,
  WeaponDef,
  WeaponId,
  EquipmentDef,
  PlayerSaveData,
  AchievementDef,
  FlightResult
} from '../types';

export const CHARACTERS: Record<CharacterId, CharacterDef> = {
  brutus: {
    id: 'brutus',
    name: 'Brutus',
    title: 'O Demolidor',
    description: 'Força bruta devastadora e punhos de aço. Lança com impacto colossal!',
    baseStats: { power: 8, precision: 4, control: 5 },
    unlockDistanceMeters: 0,
    primaryColor: '#ef4444',
    accentColor: '#fbbf24',
  },
  nika: {
    id: 'nika',
    name: 'Nika',
    title: 'A Ágil',
    description: 'Golpes com máxima precisão e reflexos supersônicos.',
    baseStats: { power: 5, precision: 8, control: 6 },
    unlockDistanceMeters: 2000,
    primaryColor: '#ec4899',
    accentColor: '#38bdf8',
  },
  volt: {
    id: 'volt',
    name: 'Volt',
    title: 'O Cyber Mestre',
    description: 'Controle aerodinâmico avançado com impulsos elétricos no ar.',
    baseStats: { power: 6, precision: 6, control: 8 },
    unlockDistanceMeters: 5000,
    primaryColor: '#eab308',
    accentColor: '#06b6d4',
  },
};

export const WEAPONS: Record<WeaponId, WeaponDef> = {
  base_bat: {
    id: 'base_bat',
    name: 'Base Bat',
    price: 0,
    bonusPower: 0,
    bonusPrecision: 2,
    bonusControl: 0,
    description: 'Taco de madeira clássico com pegada de borracha. Firme e confiável.',
    glowColor: '#f59e0b',
  },
  mega_hammer: {
    id: 'mega_hammer',
    name: 'Mega Hammer',
    price: 800,
    bonusPower: 10,
    bonusPrecision: -2,
    bonusControl: 0,
    description: 'Marreta pesada de alta pressão pneumática com impacto sísmico.',
    glowColor: '#ef4444',
  },
  cyber_bat: {
    id: 'cyber_bat',
    name: 'Cyber Bat',
    price: 1500,
    bonusPower: 6,
    bonusPrecision: 5,
    bonusControl: 0,
    description: 'Bastão futurista com lâmina de plasma ciano.',
    glowColor: '#06b6d4',
  },
  power_guitar: {
    id: 'power_guitar',
    name: 'Power Guitar',
    price: 2500,
    bonusPower: 8,
    bonusPrecision: 0,
    bonusControl: 3,
    description: 'Guitarra elétrica que dispara acordes supersônicos ao acertar!',
    glowColor: '#ec4899',
  },
  titan_mallet: {
    id: 'titan_mallet',
    name: 'Titan Mallet',
    price: 5000,
    bonusPower: 15,
    bonusPrecision: -4,
    bonusControl: 0,
    description: 'Forjada a partir de matéria escura pura de asteroides distantes.',
    glowColor: '#a855f7',
  },
  energy_club: {
    id: 'energy_club',
    name: 'Energy Club',
    price: 8000,
    bonusPower: 10,
    bonusPrecision: 6,
    bonusControl: 3,
    description: 'Clava de cristais de alta voltagem com pulso eletromagnético contínuo.',
    glowColor: '#38bdf8',
  },
};

export const EQUIPMENTS: EquipmentDef[] = [
  // Helmets
  {
    id: 'helm_cap',
    category: 'helmets',
    name: 'Boné Raio',
    price: 300,
    bonusPower: 1,
    bonusPrecision: 1,
    bonusControl: 0,
    description: 'Boné aerodinâmico esportivo.',
    iconType: 'cap',
  },
  {
    id: 'helm_viking',
    category: 'helmets',
    name: 'Elmo Viking',
    price: 900,
    bonusPower: 3,
    bonusPrecision: -1,
    bonusControl: 1,
    description: 'Chifres de guerra que intimidadam o Dummy!',
    iconType: 'viking',
  },
  {
    id: 'helm_cyber',
    category: 'helmets',
    name: 'Visor Cyber',
    price: 1800,
    bonusPower: 2,
    bonusPrecision: 3,
    bonusControl: 2,
    description: 'Visor tático com mira HUD integrada.',
    iconType: 'cyber_helm',
  },
  {
    id: 'helm_pilot',
    category: 'helmets',
    name: 'Capacete Piloto',
    price: 3200,
    bonusPower: 3,
    bonusPrecision: 4,
    bonusControl: 4,
    description: 'Tecnologia de voo de caça com oxigenação.',
    iconType: 'pilot',
  },

  // Armors
  {
    id: 'armor_sport',
    category: 'armors',
    name: 'Colete Protetor',
    price: 500,
    bonusPower: 2,
    bonusPrecision: 1,
    bonusControl: 0,
    description: 'Placa leve para impactos rápidos.',
    iconType: 'sport_vest',
  },
  {
    id: 'armor_cyber',
    category: 'armors',
    name: 'Armadura Volt',
    price: 1400,
    bonusPower: 3,
    bonusPrecision: 2,
    bonusControl: 2,
    description: 'Blindagem de titânio com reator peitoral.',
    iconType: 'cyber_armor',
  },
  {
    id: 'armor_reactor',
    category: 'armors',
    name: 'Reator Pesado',
    price: 2800,
    bonusPower: 5,
    bonusPrecision: 0,
    bonusControl: 3,
    description: 'Núcleo de fusão térmico com turbo impulsão.',
    iconType: 'reactor_armor',
  },
  {
    id: 'armor_tactical',
    category: 'armors',
    name: 'Colete Tático Neo',
    price: 4500,
    bonusPower: 4,
    bonusPrecision: 4,
    bonusControl: 5,
    description: 'Material balístico de alta flexibilidade.',
    iconType: 'tactical_vest',
  },

  // Accessories
  {
    id: 'acc_wing_bot',
    category: 'accessories',
    name: 'Pet Robô Alado',
    price: 1200,
    bonusPower: 1,
    bonusPrecision: 2,
    bonusControl: 3,
    description: 'Drone companheiro que auxilia na aerodinâmica.',
    iconType: 'wing_bot',
  },
  {
    id: 'acc_rocket_pack',
    category: 'accessories',
    name: 'Mochila Foguete',
    price: 2400,
    bonusPower: 4,
    bonusPrecision: 1,
    bonusControl: 3,
    description: 'Propulsores traseiros para sustentação de voo.',
    iconType: 'backpack',
  },
  {
    id: 'acc_energy_halo',
    category: 'accessories',
    name: 'Anel de Plasma',
    price: 4000,
    bonusPower: 3,
    bonusPrecision: 3,
    bonusControl: 4,
    description: 'Campo de força que reduz o atrito do ar.',
    iconType: 'energy_ring',
  },
  {
    id: 'acc_tri_jet',
    category: 'accessories',
    name: 'Propulsor Tri-Jet',
    price: 6000,
    bonusPower: 6,
    bonusPrecision: 3,
    bonusControl: 5,
    description: 'Três turbinas de queima rápida para máxima velocidade.',
    iconType: 'tri_jet',
  },
];

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: 'first_flight',
    title: 'Primeiro Voo',
    description: 'Lançar o Dummy Jack por mais de 100 metros.',
    rewardCoins: 100,
    rewardXp: 50,
    icon: '🚀',
    check: (s, r) => (r ? r.distance >= 100 : s.bestDistance >= 100),
  },
  {
    id: 'long_shot',
    title: 'Tiro Longo',
    description: 'Alcançar 1.000 metros de distância.',
    rewardCoins: 300,
    rewardXp: 150,
    icon: '🎯',
    check: (s, r) => (r ? r.distance >= 1000 : s.bestDistance >= 1000),
  },
  {
    id: 'sky_high',
    title: 'Nas Nuvens',
    description: 'Atingir 500 metros de altitude máxima.',
    rewardCoins: 500,
    rewardXp: 250,
    icon: '☁️',
    check: (s, r) => (r ? r.maxAltitude >= 500 : s.maxAltitudeRecord >= 500),
  },
  {
    id: 'perfect_hit',
    title: 'Golpe Perfeito',
    description: 'Acertar a zona PERFECT (94-100%) no medidor de força.',
    rewardCoins: 250,
    rewardXp: 100,
    icon: '⭐',
    check: (s, r) => (r ? (r as any).perfectHit === true : false),
  },
  {
    id: 'combo_king',
    title: 'Rei do Combo',
    description: 'Atingir Combo x10 em um único lançamento.',
    rewardCoins: 800,
    rewardXp: 400,
    icon: '🔥',
    check: (s, r) => (r ? r.maxCombo >= 10 : false),
  },
  {
    id: 'world_traveler',
    title: 'Viajante Global',
    description: 'Ultrapassar 10.000 metros (10 km) em uma partida.',
    rewardCoins: 2000,
    rewardXp: 1000,
    icon: '🌍',
    check: (s, r) => (r ? r.distance >= 10000 : s.bestDistance >= 10000),
  },
  {
    id: 'master_smasher',
    title: 'Mestre do Smash',
    description: 'Completar 25 tentativas de lançamento.',
    rewardCoins: 1500,
    rewardXp: 800,
    icon: '👑',
    check: (s) => s.totalFlights >= 25,
  },
];

const STORAGE_KEY = 'smash_trip_save_v1';

export const DEFAULT_SAVE: PlayerSaveData = {
  coins: 200,
  xp: 0,
  level: 1,
  statPoints: 0,
  upgrades: {
    power: 0,
    precision: 0,
    control: 0,
  },
  selectedCharacter: 'brutus',
  unlockedCharacters: ['brutus'],
  selectedWeapon: 'base_bat',
  ownedWeapons: ['base_bat'],
  equippedHelmet: null,
  equippedArmor: null,
  equippedAccessory: null,
  ownedEquipment: [],
  bestDistance: 0,
  maxAltitudeRecord: 0,
  maxSpeedRecord: 0,
  totalFlights: 0,
  totalSmashHits: 0,
  tutorialCompleted: false,
  unlockedAchievements: [],
  settings: {
    music: true,
    sfx: true,
    vibration: true,
    showFrame: true,
  },
};

export function getXpForNextLevel(level: number): number {
  if (level === 1) return 100;
  if (level === 2) return 250;
  if (level === 3) return 450;
  if (level === 4) return 700;
  if (level === 5) return 1000;
  return Math.floor(1000 + (level - 5) * 450);
}

export function loadGameSave(): PlayerSaveData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_SAVE };
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_SAVE,
      ...parsed,
      upgrades: { ...DEFAULT_SAVE.upgrades, ...(parsed.upgrades || {}) },
      settings: { ...DEFAULT_SAVE.settings, ...(parsed.settings || {}) },
      unlockedCharacters: Array.from(new Set(['brutus', ...(parsed.unlockedCharacters || [])])),
      ownedWeapons: Array.from(new Set(['base_bat', ...(parsed.ownedWeapons || [])])),
      ownedEquipment: parsed.ownedEquipment || [],
      unlockedAchievements: parsed.unlockedAchievements || [],
    };
  } catch (e) {
    console.error('Error loading save:', e);
    return { ...DEFAULT_SAVE };
  }
}

export function saveGameData(save: PlayerSaveData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(save));
  } catch (e) {
    console.error('Error writing save:', e);
  }
}

export const saveGameSave = saveGameData;

export function resetGameSave(): PlayerSaveData {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Error resetting save:', e);
  }
  return { ...DEFAULT_SAVE };
}

export function calculateTotalStats(save: PlayerSaveData): { power: number; precision: number; control: number } {
  const char = CHARACTERS[save.selectedCharacter] || CHARACTERS.brutus;
  const wep = WEAPONS[save.selectedWeapon] || WEAPONS.base_bat;

  let power = char.baseStats.power + wep.bonusPower + save.upgrades.power;
  let precision = char.baseStats.precision + wep.bonusPrecision + save.upgrades.precision;
  let control = char.baseStats.control + wep.bonusControl + save.upgrades.control;

  // Add equipment
  if (save.equippedHelmet) {
    const helm = EQUIPMENTS.find(e => e.id === save.equippedHelmet);
    if (helm) {
      power += helm.bonusPower;
      precision += helm.bonusPrecision;
      control += helm.bonusControl;
    }
  }
  if (save.equippedArmor) {
    const arm = EQUIPMENTS.find(e => e.id === save.equippedArmor);
    if (arm) {
      power += arm.bonusPower;
      precision += arm.bonusPrecision;
      control += arm.bonusControl;
    }
  }
  if (save.equippedAccessory) {
    const acc = EQUIPMENTS.find(e => e.id === save.equippedAccessory);
    if (acc) {
      power += acc.bonusPower;
      precision += acc.bonusPrecision;
      control += acc.bonusControl;
    }
  }

  return {
    power: Math.max(1, power),
    precision: Math.max(1, precision),
    control: Math.max(1, control),
  };
}
