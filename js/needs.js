// The dog's needs: mood and energy as clamped 0-100 levels, driven every
// frame from the single TUNING table below (Epic design D8). This module
// absorbs the minimal mood seam js/mood.js shipped in Milestone 4; the greet
// and pet gains moved into the table unchanged.

export const TUNING = {
  moodStart: 55,
  energyStart: 92,
  energyDrainRun: 6, // per second while running
  energyCostJump: 5, // chunk per fired jump
  energyRecoverIdle: 8, // per second while standing or sitting
  energyRecoverWalk: 3.5, // per second while walking
  energyLowThreshold: 15, // run/jump re-enable past this (hysteresis)
  moodDecay: 0.35, // per second, always-on
  moodGainFetch: 10,
  moodGainGreet: 8,
  moodGainPet: 10
};

const clamp = (value) => Math.max(0, Math.min(100, value));

export function createNeeds() {
  return {
    mood: {
      value: clamp(TUNING.moodStart),
      gain(amount, reason) {
        this.value = clamp(this.value + amount);
        return this.value;
      }
    },
    energy: {
      value: clamp(TUNING.energyStart)
    },
    exhausted: false,
    canRunJump() {
      return !this.exhausted;
    },
    gain(amount, reason) {
      return this.mood.gain(amount, reason);
    },
    update(dt, activity) {
      this.mood.value = clamp(this.mood.value - TUNING.moodDecay * dt);
      if (activity === 'run') {
        this.energy.value -= TUNING.energyDrainRun * dt;
      } else if (activity === 'jump') {
        this.energy.value -= TUNING.energyCostJump;
      } else if (activity === 'walk') {
        this.energy.value += TUNING.energyRecoverWalk * dt;
      } else if (activity !== 'air') {
        // idle, sit (and anything else calm) recover at the idle rate; air
        // frames after the launch are already paid for by the jump chunk.
        this.energy.value += TUNING.energyRecoverIdle * dt;
      }
      this.energy.value = clamp(this.energy.value);
      if (this.energy.value <= 0) {
        this.exhausted = true;
      } else if (this.energy.value >= TUNING.energyLowThreshold) {
        this.exhausted = false;
      }
    }
  };
}
