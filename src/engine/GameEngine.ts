import {
  GameplayPhase,
  CharacterId,
  WeaponId,
  FlightResult,
  PlayerSaveData,
  Particle,
  ComicFX,
  BoosterEntity
} from '../types';
import { WorldManager } from './WorldManager';
import { GameRenderer } from './GameRenderer';
import { audioManager } from '../services/audio';
import { calculateTotalStats, ACHIEVEMENTS, getXpForNextLevel } from '../services/storage';

export class GameEngine {
  public phase: GameplayPhase = 'PREPARING';
  public world: WorldManager;
  public renderer: GameRenderer | null = null;

  // Launch Inputs
  public angleDegrees = 45;
  public angleOscDirection = 1;
  public powerPercent = 50;
  public powerOscDirection = 1;
  public isPerfectHit = false;
  public isCriticalHit = false;

  // Swing Animation
  public swingProgress = 0;
  public swingDuration = 0.65; // ~250ms windup + 160ms swing + 240ms recovery
  public swingTimer = 0;

  // Target Dummy Jack Physics (in world meters: 1m ~ 25px standard)
  public dummyX = 4.2;
  public dummyY = 0.0;
  public dummyVx = 0.0;
  public dummyVy = 0.0;
  public dummyRotation = 0;
  public dummyAngularVel = 0;
  public dummyGrounded = true;
  public dummyState: 'idle' | 'hit' | 'flying' | 'spinning' | 'groundHit' | 'bounce' | 'rolling' | 'stopped' = 'idle';
  public dummyExpression: 'happy' | 'shocked' | 'dizzy' | 'ko' = 'happy';
  public dummySquashX = 1.0;
  public dummySquashY = 1.0;

  // Cannon capture state
  public inCannonTimer = 0;

  // Flight Stats & Records
  public currentDistance = 0;
  public currentAltitude = 0;
  public currentSpeedKmh = 0;
  public maxAltitude = 0;
  public maxSpeed = 0;
  public currentCombo = 1;
  public maxCombo = 1;
  public boostersHit = 0;
  public coinsCollectedInRun = 0;
  public xpCollectedInRun = 0;
  public powerSmashAvailable = true;

  // In-flight Controls
  public steeringInput: 'none' | 'left' | 'right' = 'none';

  // Camera & Screen Shake
  public camX = 0;
  public camY = 0;
  public camZoom = 1.05;
  public shakeIntensity = 0;
  public shakeDuration = 0;
  public freezeFrameTimer = 0; // seconds

  // Debugging
  public showHitDebug = false;

  // Particles & FX
  public particles: Particle[] = [];
  public comicFXList: ComicFX[] = [];

  // References
  public save: PlayerSaveData;
  public onFlightFinished?: (result: FlightResult) => void;
  public onUpdateUI?: () => void;

  private lastTime = 0;
  private animFrameId: number | null = null;
  private isRunning = false;

  constructor(save: PlayerSaveData) {
    this.save = save;
    this.world = new WorldManager();
  }

  public setSave(save: PlayerSaveData) {
    this.save = save;
  }

  public init(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    this.renderer = new GameRenderer(ctx, canvas.width, canvas.height);
    this.resetRun();
  }

  public startLoop() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();

    const loop = (currentTime: number) => {
      if (!this.isRunning) return;

      const rawDt = (currentTime - this.lastTime) / 1000;
      this.lastTime = currentTime;

      // Clamped dt (Rule #23: between 0.001 and 0.05)
      const dt = Math.min(0.05, Math.max(0.001, rawDt));

      this.update(dt);
      this.render();

      this.animFrameId = requestAnimationFrame(loop);
    };

    this.animFrameId = requestAnimationFrame(loop);
  }

  public stopLoop() {
    this.isRunning = false;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  public resetRun() {
    this.phase = 'PREPARING';
    this.world.reset();

    this.angleDegrees = 35;
    this.angleOscDirection = 1;
    this.powerPercent = 50;
    this.powerOscDirection = 1;
    this.isPerfectHit = false;

    this.swingProgress = 0;
    this.swingTimer = 0;

    this.dummyX = 4.2;
    this.dummyY = 0.0;
    this.dummyVx = 0.0;
    this.dummyVy = 0.0;
    this.dummyRotation = 0;
    this.dummyAngularVel = 0;
    this.dummyGrounded = true;
    this.dummyState = 'idle';
    this.dummyExpression = 'happy';

    this.inCannonTimer = 0;

    this.currentDistance = 0;
    this.currentAltitude = 0;
    this.currentSpeedKmh = 0;
    this.maxAltitude = 0;
    this.maxSpeed = 0;
    this.currentCombo = 1;
    this.maxCombo = 1;
    this.boostersHit = 0;
    this.coinsCollectedInRun = 0;
    this.xpCollectedInRun = 0;
    this.powerSmashAvailable = true;

    this.steeringInput = 'none';

    this.camX = 0;
    this.camY = 0;
    this.camZoom = 1.0;
    this.shakeIntensity = 0;
    this.shakeDuration = 0;
    this.freezeFrameTimer = 0;

    this.particles = [];
    this.comicFXList = [];

    if (this.onUpdateUI) this.onUpdateUI();
  }

  // --- TOUCH / TAP CONTROLS ---

  public handleTap() {
    audioManager.playClick();

    if (this.phase === 'PREPARING') {
      this.phase = 'ANGLE_SELECTION';
    } else if (this.phase === 'ANGLE_SELECTION') {
      this.phase = 'POWER_SELECTION';
    } else if (this.phase === 'POWER_SELECTION') {
      // Check Perfect Zone (94% to 100%)
      const precisionBonus = calculateTotalStats(this.save).precision;
      const perfectThreshold = Math.max(90, 95 - precisionBonus * 0.5);

      this.isPerfectHit = this.powerPercent >= perfectThreshold;
      if (this.isPerfectHit) {
        audioManager.playPerfect();
        this.spawnComicFX(this.dummyX, 3.5, 'PERFECT!');
      }

      this.phase = 'SWING';
      this.swingProgress = 0;
      this.swingTimer = 0;
      audioManager.playSwing();
    }
  }

  public triggerPowerSmash() {
    if (!this.powerSmashAvailable) return;
    if (this.phase !== 'FLYING' && this.phase !== 'GROUND_BOUNCE' && this.phase !== 'ROLLING') return;

    this.powerSmashAvailable = false;
    const stats = calculateTotalStats(this.save);

    // Powerful forward and upward impulse
    const baseSmashPower = 28 + stats.power * 2.2;
    this.dummyVx = Math.max(this.dummyVx + baseSmashPower, baseSmashPower * 1.3);
    this.dummyVy = -Math.max(26 + stats.power * 1.5, Math.abs(this.dummyVy) * 0.8 + 18);
    this.dummyAngularVel = 16;
    this.dummyState = 'flying';
    this.dummyExpression = 'shocked';

    this.currentCombo++;
    if (this.currentCombo > this.maxCombo) this.maxCombo = this.currentCombo;

    this.triggerScreenShake(18, 0.45);
    this.freezeFrameTimer = 0.08;
    audioManager.playPowerSmash();

    this.spawnComicFX(this.dummyX, this.dummyY + 1.5, 'SMASH!');
    this.spawnExplosion(this.dummyX, this.dummyY + 1, '#ef4444', 35);
  }

  public setSteering(input: 'none' | 'left' | 'right') {
    this.steeringInput = input;
  }

  // --- UPDATE LOOP ---

  private update(dt: number) {
    if (this.phase === 'PAUSED' || this.phase === 'RESULT') return;

    // Freeze frame pause
    if (this.freezeFrameTimer > 0) {
      this.freezeFrameTimer -= dt;
      return;
    }

    // Screen Shake decay
    if (this.shakeDuration > 0) {
      this.shakeDuration -= dt;
      if (this.shakeDuration <= 0) this.shakeIntensity = 0;
    }

    // Angle Selection Oscillation (15° to 60°)
    if (this.phase === 'ANGLE_SELECTION') {
      const angleSpeed = 55; // deg/sec
      this.angleDegrees += this.angleOscDirection * angleSpeed * dt;
      if (this.angleDegrees >= 60) {
        this.angleDegrees = 60;
        this.angleOscDirection = -1;
      } else if (this.angleDegrees <= 15) {
        this.angleDegrees = 15;
        this.angleOscDirection = 1;
      }
    }

    // Power Selection Oscillation (0% to 100%)
    if (this.phase === 'POWER_SELECTION') {
      const powerSpeed = 120; // percent/sec
      this.powerPercent += this.powerOscDirection * powerSpeed * dt;
      if (this.powerPercent >= 100) {
        this.powerPercent = 100;
        this.powerOscDirection = -1;
      } else if (this.powerPercent <= 0) {
        this.powerPercent = 0;
        this.powerOscDirection = 1;
      }
    }

    // Swing Execution
    if (this.phase === 'SWING') {
      this.swingTimer += dt;
      this.swingProgress = Math.min(1, this.swingTimer / this.swingDuration);

      if (this.swingProgress >= 0.65 && this.dummyState === 'idle') {
        // MOMENT OF IMPACT! (Bat connects with Dummy Jack)
        this.executeImpact();
      }

      // Dummy Jack starts moving after impact during follow-through
      if (this.swingProgress >= 0.65 && this.dummyState === 'hit') {
        this.dummyX += this.dummyVx * dt;
        this.dummyY += this.dummyVy * dt;
        this.dummyRotation += this.dummyAngularVel * dt;
        // Relax squash/stretch
        this.dummySquashX += (1.0 - this.dummySquashX) * Math.min(1, dt * 12);
        this.dummySquashY += (1.0 - this.dummySquashY) * Math.min(1, dt * 12);
      }

      if (this.swingProgress >= 1.0) {
        this.phase = 'FLYING';
        this.dummyState = 'flying';
        this.dummySquashX = 1.0;
        this.dummySquashY = 1.0;
      }
    }

    // Cannon Hold Timer
    if (this.inCannonTimer > 0) {
      this.inCannonTimer -= dt;
      if (this.inCannonTimer <= 0) {
        // Fire out of cannon!
        this.dummyVx = 65;
        this.dummyVy = -48;
        this.dummyState = 'flying';
        this.dummyExpression = 'shocked';
        this.dummyRotation = -Math.PI / 4;
        audioManager.playCannon();
        this.spawnComicFX(this.dummyX, this.dummyY + 2, 'BOOM!');
        this.spawnExplosion(this.dummyX, this.dummyY + 1.5, '#f97316', 30);
        this.triggerScreenShake(14, 0.35);
      } else {
        // Held in cannon
        return;
      }
    }

    // Physics Simulation (Flying, GroundBounce, Rolling)
    if (
      this.phase === 'FLYING' ||
      this.phase === 'GROUND_BOUNCE' ||
      this.phase === 'ROLLING' ||
      this.phase === 'LAUNCH'
    ) {
      this.updatePhysics(dt);
      this.world.updateWorld(this.dummyX);
      this.checkBoosterCollisions();
      this.checkCollectibleCollisions();
    }

    // Particles & Comic FX Update
    this.updateParticles(dt);
    this.updateComicFX(dt);

    // Camera Tracking
    this.updateCamera(dt);
  }

  // --- IMPACT & PHYSICS ---

  private executeImpact() {
    const stats = calculateTotalStats(this.save);
    const rad = (this.angleDegrees * Math.PI) / 180;

    // Power calculation: Character Power + Weapon Power + Selected Power
    let powerFactor = (this.powerPercent / 100) * (34 + stats.power * 2.8);

    // Perfect Hit Bonus (+8% power)
    if (this.isPerfectHit) {
      powerFactor *= 1.08;
    }

    // Critical Strike Chance (~5%)
    this.isCriticalHit = Math.random() < 0.05;
    if (this.isCriticalHit) {
      powerFactor *= 1.25;
    }

    this.dummyVx = Math.cos(rad) * powerFactor;
    this.dummyVy = -Math.sin(rad) * powerFactor;
    this.dummyAngularVel = 14;
    this.dummyGrounded = false;
    this.dummyState = 'hit';
    this.dummyExpression = this.isCriticalHit ? 'ko' : 'shocked';

    // Squash & Stretch on Impact
    this.dummySquashX = 0.88;
    this.dummySquashY = 1.12;

    // Freeze Frame (Hit-Stop: 70ms) & Screen Shake
    this.freezeFrameTimer = 0.07;
    this.triggerScreenShake(this.isCriticalHit ? 22 : 16, 0.4);

    // Haptic Vibration if supported on mobile
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(this.isCriticalHit ? [50, 40, 60] : [40, 30, 40]);
      } catch (_) {}
    }

    // Comic FX & Sound
    const comicWords: ('POW!' | 'BAM!' | 'KRAK!' | 'BOOM!' | 'SMASH!')[] = ['POW!', 'BAM!', 'KRAK!', 'BOOM!', 'SMASH!'];
    const word = this.isCriticalHit ? 'SMASH!' : (this.isPerfectHit ? 'KRAK!' : comicWords[Math.floor(Math.random() * comicWords.length)]);
    audioManager.playImpact(word.replace('!', '') as any);

    this.spawnComicFX(this.dummyX + 0.8, 1.8, word);
    this.spawnExplosion(this.dummyX, 1.2, this.isCriticalHit ? '#ef4444' : '#facc15', this.isCriticalHit ? 35 : 24);
  }

  private updatePhysics(dt: number) {
    const stats = calculateTotalStats(this.save);

    // Gravity (9.81 m/s^2)
    const gravity = 9.81;

    // Air Drag (diminished by control)
    const dragCoeff = Math.max(0.0008, 0.0022 - stats.control * 0.0001);
    const speed = Math.sqrt(this.dummyVx * this.dummyVx + this.dummyVy * this.dummyVy);
    const dragForce = 0.5 * dragCoeff * speed * speed;

    this.dummyVx -= (this.dummyVx / (speed || 1)) * dragForce * dt;
    this.dummyVy -= (this.dummyVy / (speed || 1)) * dragForce * dt;

    // Apply In-Air Steering (Left = Glide / Pitch up, Right = Dive / Speed up)
    if (!this.dummyGrounded && this.phase === 'FLYING') {
      const steerInfluence = 0.7 + stats.control * 0.25;
      if (this.steeringInput === 'left') {
        // Tilt Back / Aerodynamic Glide
        this.dummyVy -= 7.5 * steerInfluence * dt;
        this.dummyVx -= 3.0 * steerInfluence * dt;
        this.dummyRotation -= 3.5 * dt;
      } else if (this.steeringInput === 'right') {
        // Dive Forward
        this.dummyVx += 6.5 * steerInfluence * dt;
        this.dummyVy += 4.5 * steerInfluence * dt;
        this.dummyRotation += 4.5 * dt;
      } else {
        // Natural rotation based on trajectory
        this.dummyRotation += this.dummyAngularVel * dt;
        this.dummyAngularVel *= 0.98;
      }
    }

    // Apply Gravity
    this.dummyVy += gravity * dt;

    // Move Dummy
    this.dummyX += this.dummyVx * dt;
    this.dummyY += this.dummyVy * dt;

    // Keep distance & altitude updated
    this.currentDistance = Math.max(0, this.dummyX);
    this.currentAltitude = Math.max(0, -this.dummyY);
    this.currentSpeedKmh = speed * 3.6;

    if (this.currentAltitude > this.maxAltitude) this.maxAltitude = this.currentAltitude;
    if (this.currentSpeedKmh > this.maxSpeed) this.maxSpeed = this.currentSpeedKmh;

    // Ground Collision (y >= 0 is ground)
    if (this.dummyY >= 0) {
      this.dummyY = 0;
      const verticalImpactSpeed = Math.abs(this.dummyVy);

      // Bounce factor (0.42 to 0.52)
      const bounceFactor = 0.46;
      const frictionFactor = 0.82;

      if (verticalImpactSpeed > 4.5) {
        // GROUND BOUNCE
        this.phase = 'GROUND_BOUNCE';
        this.dummyState = 'groundHit';
        this.dummyVy = -verticalImpactSpeed * bounceFactor;
        this.dummyVx *= frictionFactor;
        this.dummyGrounded = false;
        this.dummyAngularVel *= 0.6;

        audioManager.playGroundBounce(Math.min(1, verticalImpactSpeed / 25));
        this.spawnDust(this.dummyX, 0, Math.min(25, verticalImpactSpeed * 1.5));
        this.triggerScreenShake(Math.min(12, verticalImpactSpeed * 0.4), 0.2);
      } else {
        // ROLLING
        this.phase = 'ROLLING';
        this.dummyState = 'rolling';
        this.dummyGrounded = true;
        this.dummyVy = 0;

        // Ground rolling friction
        this.dummyVx *= Math.pow(0.55, dt);
        this.dummyRotation += (this.dummyVx * dt) / 0.5;

        // Spawn rolling dust
        if (Math.random() < 0.35 && Math.abs(this.dummyVx) > 2) {
          this.spawnDust(this.dummyX, 0, 2);
        }

        // STOPPED CONDITION (< 1.2 m/s)
        if (Math.abs(this.dummyVx) < 1.2) {
          this.dummyVx = 0;
          this.dummyState = 'stopped';
          this.dummyExpression = 'ko';
          this.phase = 'STOPPED';
          setTimeout(() => this.finishFlight(), 1200);
        }
      }
    }
  }

  // --- BOOSTER & COLLECTIBLE COLLISIONS ---

  private checkBoosterCollisions() {
    for (const b of this.world.boosters) {
      if (b.activated) continue;

      // AABB overlap check in meters
      const dx = Math.abs(this.dummyX - b.x);
      const dy = Math.abs(this.dummyY - b.y);

      if (dx < b.width * 0.5 + 0.8 && dy < b.height * 0.5 + 0.8) {
        b.activated = true;
        this.boostersHit++;
        this.currentCombo++;
        if (this.currentCombo > this.maxCombo) this.maxCombo = this.currentCombo;

        // Dispatch Booster Interaction
        this.handleBoosterHit(b);
      }
    }
  }

  private handleBoosterHit(b: BoosterEntity) {
    const stats = calculateTotalStats(this.save);

    if (b.type === 'trampoline') {
      // Big Vertical Trampoline launch
      this.dummyVy = -38;
      this.dummyVx = Math.max(this.dummyVx * 1.15, 18);
      this.dummyState = 'flying';
      this.dummyExpression = 'shocked';
      audioManager.playBoing();
      this.spawnComicFX(b.x, b.y + 2, 'BOOM!');
      this.triggerScreenShake(8, 0.25);
    } else if (b.type === 'cannon') {
      // Capture and shoot
      this.inCannonTimer = 0.38; // 380 ms capture
      this.dummyX = b.x;
      this.dummyY = b.y - 1;
      this.dummyVx = 0;
      this.dummyVy = 0;
    } else if (b.type === 'boxer') {
      // Boxer punch!
      this.dummyVx += 45;
      this.dummyVy = -18;
      this.dummyState = 'flying';
      this.dummyExpression = 'dizzy';
      audioManager.playBoxerPunch();
      this.spawnComicFX(b.x + 1, b.y + 2, 'POW!');
      this.triggerScreenShake(12, 0.3);
      this.spawnExplosion(b.x, b.y + 1, '#dc2626', 20);
    } else if (b.type === 'spring') {
      // Classic spring
      this.dummyVy = -28;
      this.dummyVx = Math.max(this.dummyVx * 1.08, 14);
      this.dummyState = 'bounce';
      audioManager.playBoing();
      this.spawnDust(b.x, b.y, 15);
    } else if (b.type === 'platform') {
      // Speed acceleration pad
      this.dummyVx += 32;
      this.dummyVy = -8;
      audioManager.playBoing();
      this.spawnDust(b.x, b.y, 20);
      this.spawnComicFX(b.x, b.y + 2, 'SMASH!');
    } else if (b.type === 'balloon') {
      // Air balloon bounce
      this.dummyVy = -30;
      this.dummyVx += 12;
      audioManager.playBoing();
      this.spawnExplosion(b.x, b.y, '#facc15', 18);
    } else if (b.type === 'drone') {
      // Air drone bump
      this.dummyVx += 24;
      this.dummyVy = -16;
      audioManager.playImpact('BAM');
      this.spawnExplosion(b.x, b.y, '#38bdf8', 15);
    } else {
      // Thrust Tower
      this.dummyVy = -46;
      this.dummyVx += 20;
      audioManager.playCannon();
      this.spawnExplosion(b.x, b.y, '#f97316', 35);
      this.triggerScreenShake(14, 0.35);
    }
  }

  private checkCollectibleCollisions() {
    for (const c of this.world.collectibles) {
      if (c.collected) continue;
      const dx = Math.abs(this.dummyX - c.x);
      const dy = Math.abs(this.dummyY - c.y);

      if (dx < 2.0 && dy < 2.0) {
        c.collected = true;
        if (c.type === 'xp_star') {
          this.xpCollectedInRun += c.value;
          audioManager.playGem();
        } else if (c.type === 'coin') {
          this.coinsCollectedInRun += c.value;
          audioManager.playCoin();
        } else {
          this.coinsCollectedInRun += c.value;
          audioManager.playGem();
        }
        this.spawnSparkles(c.x, c.y, 8, '#facc15');
      }
    }
  }

  // --- RESULT & PROGRESSION ---

  private finishFlight() {
    this.phase = 'RESULT';

    // Coins and XP calculation
    const distanceCoins = Math.floor(this.currentDistance * 0.15);
    const comboMultiplier = Math.max(1, this.maxCombo * 0.35);
    const totalCoins = Math.floor((distanceCoins + this.coinsCollectedInRun) * comboMultiplier);
    const totalXp = Math.floor((Math.floor(this.currentDistance * 0.1) + this.xpCollectedInRun) * comboMultiplier);

    const isNewRecord = this.currentDistance > this.save.bestDistance;
    if (isNewRecord) {
      audioManager.playNewRecord();
    }

    // Update Save
    const updatedSave: PlayerSaveData = { ...this.save };
    updatedSave.coins += totalCoins;
    updatedSave.xp += totalXp;
    updatedSave.totalFlights++;
    if (this.currentDistance > updatedSave.bestDistance) updatedSave.bestDistance = Math.floor(this.currentDistance);
    if (this.maxAltitude > updatedSave.maxAltitudeRecord) updatedSave.maxAltitudeRecord = Math.floor(this.maxAltitude);
    if (this.maxSpeed > updatedSave.maxSpeedRecord) updatedSave.maxSpeedRecord = Math.floor(this.maxSpeed);

    // Check Level Up
    let levelUp = false;
    while (updatedSave.xp >= getXpForNextLevel(updatedSave.level)) {
      updatedSave.xp -= getXpForNextLevel(updatedSave.level);
      updatedSave.level++;
      updatedSave.statPoints++;
      levelUp = true;
    }

    // Check Character Unlocks (Nika at 2000m, Volt at 5000m)
    let unlockedHero: string | undefined = undefined;
    if (updatedSave.bestDistance >= 2000 && !updatedSave.unlockedCharacters.includes('nika')) {
      updatedSave.unlockedCharacters.push('nika');
      unlockedHero = 'Nika';
    }
    if (updatedSave.bestDistance >= 5000 && !updatedSave.unlockedCharacters.includes('volt')) {
      updatedSave.unlockedCharacters.push('volt');
      unlockedHero = 'Volt';
    }

    const flightResult: FlightResult = {
      distance: Math.floor(this.currentDistance),
      maxAltitude: Math.floor(this.maxAltitude),
      maxSpeed: Math.floor(this.maxSpeed),
      maxCombo: this.maxCombo,
      boostersHit: this.boostersHit,
      coinsEarned: totalCoins,
      xpEarned: totalXp,
      isNewRecord,
      levelUp,
      unlockedHero,
    };

    // Check Achievements
    ACHIEVEMENTS.forEach((ach) => {
      if (!updatedSave.unlockedAchievements.includes(ach.id)) {
        if (ach.check(updatedSave, flightResult)) {
          updatedSave.unlockedAchievements.push(ach.id);
          updatedSave.coins += ach.rewardCoins;
          updatedSave.xp += ach.rewardXp;
        }
      }
    });

    this.save = updatedSave;
    if (this.onFlightFinished) {
      this.onFlightFinished(flightResult);
    }
  }

  // --- CAMERA ---

  private updateCamera(dt: number) {
    let targetX = this.dummyX;
    let targetY = this.dummyY;
    let targetZoom = 1.05;

    if (
      this.phase === 'PREPARING' ||
      this.phase === 'ANGLE_SELECTION' ||
      this.phase === 'POWER_SELECTION' ||
      (this.phase === 'SWING' && this.swingProgress < 0.65)
    ) {
      // In preparation phase, center nicely between Brutus (0m) and Dummy Jack (4.2m)
      targetX = 1.8;
      targetY = 0;
      targetZoom = 1.05;
    } else {
      // In flight: track Dummy Jack with dynamic zoom
      const speedRatio = Math.min(1, this.currentSpeedKmh / 240);
      targetZoom = Math.max(0.78, 1.05 - speedRatio * 0.28);
    }

    // Smooth lerp camera
    this.camX += (targetX - this.camX) * Math.min(1, dt * 5.5);
    this.camY += (targetY - this.camY) * Math.min(1, dt * 5.5);
    this.camZoom += (targetZoom - this.camZoom) * Math.min(1, dt * 4.0);
  }

  public worldToScreenX = (x: number): number => {
    if (!this.renderer) return 0;
    const w = (this.renderer as any).width || 800;
    const shakeOffsetX = this.shakeDuration > 0 ? (Math.random() - 0.5) * this.shakeIntensity : 0;
    // Lead camera offset: During flight, keep character at ~38% from left to see ahead!
    const isFlightPhase = this.phase === 'FLYING' || this.phase === 'GROUND_BOUNCE' || this.phase === 'ROLLING' || (this.phase === 'SWING' && this.swingProgress >= 0.65);
    const leadRatio = isFlightPhase ? 0.38 : 0.25;
    return (x - this.camX) * 25 * this.camZoom + w * leadRatio + shakeOffsetX;
  };

  public worldToScreenY = (y: number): number => {
    if (!this.renderer) return 0;
    const h = (this.renderer as any).height || 450;
    const shakeOffsetY = this.shakeDuration > 0 ? (Math.random() - 0.5) * this.shakeIntensity : 0;
    // Ground level sits at h * 0.76
    return (y - this.camY) * 25 * this.camZoom + h * 0.76 + shakeOffsetY;
  };

  public triggerScreenShake(intensity: number, duration: number) {
    this.shakeIntensity = intensity;
    this.shakeDuration = duration;
  }

  // --- PARTICLES & FX ---

  private spawnDust(x: number, y: number, count: number) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 8,
        vy: -Math.random() * 6,
        life: 0.4 + Math.random() * 0.3,
        maxLife: 0.7,
        size: 3 + Math.random() * 5,
        color: '#e2e8f0',
        alpha: 1,
        type: 'dust',
      });
    }
  }

  private spawnExplosion(x: number, y: number, color: string, count: number) {
    // Shockwave
    this.particles.push({
      x,
      y,
      vx: 0,
      vy: 0,
      life: 0.3,
      maxLife: 0.3,
      size: 40,
      color,
      alpha: 1,
      type: 'shockwave',
    });

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = 6 + Math.random() * 16;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        life: 0.35 + Math.random() * 0.35,
        maxLife: 0.7,
        size: 4 + Math.random() * 6,
        color: Math.random() < 0.5 ? color : '#fef08a',
        alpha: 1,
        type: 'spark',
      });
    }
  }

  private spawnSparkles(x: number, y: number, count: number, color: string) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        life: 0.4 + Math.random() * 0.2,
        maxLife: 0.6,
        size: 3 + Math.random() * 4,
        color,
        alpha: 1,
        type: 'star',
        rotation: Math.random() * Math.PI,
      });
    }
  }

  private spawnComicFX(x: number, y: number, text: 'POW!' | 'BAM!' | 'KRAK!' | 'BOOM!' | 'SMASH!' | 'PERFECT!') {
    const colors: Record<string, string> = {
      'POW!': '#dc2626',
      'BAM!': '#ea580c',
      'KRAK!': '#0284c7',
      'BOOM!': '#b91c1c',
      'SMASH!': '#e11d48',
      'PERFECT!': '#eab308',
    };
    this.comicFXList.push({
      x,
      y,
      text,
      life: 0.8,
      maxLife: 0.8,
      scale: 1.2,
      rotation: (Math.random() - 0.5) * 0.3,
      color: colors[text] || '#dc2626',
    });
  }

  private updateParticles(dt: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 4 * dt; // mild gravity on particles
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  private updateComicFX(dt: number) {
    for (let i = this.comicFXList.length - 1; i >= 0; i--) {
      const c = this.comicFXList[i];
      c.life -= dt;
      c.y -= 1.2 * dt;
      if (c.life <= 0) {
        this.comicFXList.splice(i, 1);
      }
    }
  }

  // --- RENDER PASS ---

  public render() {
    if (!this.renderer) return;

    const biome = this.world.getCurrentBiome(this.dummyX);
    const gameTime = performance.now() / 1000;

    // 1. Background & Parallax
    this.renderer.renderBackground(this.camX, this.camY, this.camZoom, biome);

    // 2. Ground Terrain
    this.renderer.renderGround(this.camX, this.camY, this.camZoom, this.worldToScreenY, biome);

    // 3. Scenery Props
    this.renderer.renderScenery(
      this.world.sceneries,
      this.camX,
      this.camY,
      this.camZoom,
      this.worldToScreenX,
      this.worldToScreenY
    );

    // 4. Boosters
    this.renderer.renderBoosters(
      this.world.boosters,
      this.camZoom,
      this.worldToScreenX,
      this.worldToScreenY
    );

    // 5. Collectibles
    this.renderer.renderCollectibles(
      this.world.collectibles,
      this.camZoom,
      this.worldToScreenX,
      this.worldToScreenY,
      gameTime
    );

    // 6. Launcher Character (Brutus / Nika / Volt)
    const launcherScreenX = this.worldToScreenX(0);
    const launcherScreenY = this.worldToScreenY(0);
    const launcherState =
      this.phase === 'PREPARING'
        ? 'idle'
        : this.phase === 'ANGLE_SELECTION' || this.phase === 'POWER_SELECTION'
        ? 'prepare'
        : this.phase === 'SWING'
        ? 'swing'
        : 'recovery';

    this.renderer.renderLauncher(
      this.save.selectedCharacter,
      this.save.selectedWeapon,
      launcherState,
      this.swingProgress,
      launcherScreenX,
      launcherScreenY,
      this.camZoom,
      this.showHitDebug
    );

    // 7. Dummy Jack Target
    const dummyScreenX = this.worldToScreenX(this.dummyX);
    const dummyScreenY = this.worldToScreenY(this.dummyY);

    this.renderer.renderDummyJack(
      this.dummyState,
      this.dummyExpression,
      dummyScreenX,
      dummyScreenY,
      this.dummyRotation,
      this.camZoom,
      this.dummySquashX,
      this.dummySquashY,
      this.showHitDebug
    );

    // 8. Particles & Comic FX
    this.renderer.renderParticles(this.particles, this.worldToScreenX, this.worldToScreenY, this.camZoom);
    this.renderer.renderComicFX(this.comicFXList, this.worldToScreenX, this.worldToScreenY);

    // 9. Speed Lines
    this.renderer.renderSpeedLines(this.currentSpeedKmh / 250);
  }
}
