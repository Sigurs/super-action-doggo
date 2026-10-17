import { TUNING } from './dog-controller.js';

export function updateIdle(dog, elapsedTime, options = {}) {
  const parts = dog.userData.parts;
  const breatheSpeed = options.breatheSpeed ?? 2.4;
  parts.torso.position.y = parts.torso.userData.baseY
    + Math.sin(elapsedTime * breatheSpeed) * (options.bobAmount ?? 0.02);
  parts.tail.rotation.y = Math.sin(elapsedTime * (options.wagSpeed ?? 6))
    * (options.wagAmount ?? 0.55);
  parts.head.rotation.x = Math.sin(elapsedTime * breatheSpeed + 0.9) * 0.05;
}

const clamp01 = (value) => Math.max(0, Math.min(1, value));
const lerp = (a, b, t) => a + (b - a) * t;

const EASE_RATES = {
  legs: 12,
  torso: 8,
  head: 12,
  sitDown: 6,
  standUp: 12,
  air: 9,
  gait: 6,
  run: 4,
  overlay: 8
};

const BARK_DURATION = 0.45;
const CARRY_DIP_DURATION = 0.5;

export class DogAnimator {
  constructor(dog) {
    this.parts = dog.userData.parts;
    this.params = dog.userData.params;
    this.elapsed = 0;
    this.phase = 0;
    this.tailPhase = 0;
    this.barkTimer = 0;
    this.carryDipTimer = 0;
    this.gaitW = 0;
    this.runW = 0;
    this.sitW = 0;
    this.airW = 0;
    this.sniffW = 0;
    this.greetW = 0;
    this.carryW = 0;
    this.channels = {
      torsoPitch: 0,
      torsoLift: 0,
      headPitch: 0,
      tailAmp: 0.55,
      tailSpeed: 6,
      frontLeft: 0,
      frontRight: 0,
      backLeft: 0,
      backRight: 0
    };
  }

  triggerBark() {
    this.barkTimer = BARK_DURATION;
  }

  triggerCarryDip() {
    this.carryDipTimer = CARRY_DIP_DURATION;
  }

  easeWeight(weight, target, rate, dt) {
    return lerp(weight, target, 1 - Math.exp(-rate * dt));
  }

  easeChannel(name, target, rate, dt) {
    this.channels[name] = lerp(this.channels[name], target, 1 - Math.exp(-rate * dt));
  }

  update(dt, state = {}) {
    this.elapsed += dt;
    this.barkTimer = Math.max(0, this.barkTimer - dt);
    this.carryDipTimer = Math.max(0, this.carryDipTimer - dt);

    const locomotion = state.locomotion ?? 'idle';
    const speed = state.speed ?? 0;
    const grounded = state.grounded ?? true;
    const sitting = locomotion === 'sit';
    const sniffing = locomotion === 'sniff';
    const greeting = state.greeting === true;
    const carrying = state.carrying === true;
    const moving = speed > 0.35;
    const running = moving && speed > TUNING.walkSpeed * 1.25;

    this.gaitW = this.easeWeight(this.gaitW, moving ? 1 : 0, EASE_RATES.gait, dt);
    this.runW = this.easeWeight(this.runW, running ? 1 : 0, EASE_RATES.run, dt);
    this.sitW = this.easeWeight(
      this.sitW,
      sitting ? 1 : 0,
      sitting ? EASE_RATES.sitDown : EASE_RATES.standUp,
      dt
    );
    this.airW = this.easeWeight(this.airW, grounded ? 0 : 1, EASE_RATES.air, dt);
    this.sniffW = this.easeWeight(this.sniffW, sniffing && !moving ? 1 : 0, EASE_RATES.overlay, dt);
    this.greetW = this.easeWeight(this.greetW, greeting ? 1 : 0, EASE_RATES.overlay, dt);
    this.carryW = this.easeWeight(this.carryW, carrying ? 1 : 0, EASE_RATES.overlay, dt);

    if (moving) {
      this.phase += dt * (2.6 + speed * 2.2);
    }

    const p = this.params;
    const legLength = p.legLength;
    const sitPitch = -(0.26 + 0.34 * legLength);
    const sitDrop = 0.42 * legLength;
    const hindFold = -(0.9 + 0.9 * legLength);

    this.easeChannel('torsoPitch',
      this.sitW * sitPitch + this.airW * -0.22, EASE_RATES.torso, dt);
    this.easeChannel('torsoLift',
      this.sitW * -sitDrop, EASE_RATES.torso, dt);
    this.easeChannel('headPitch',
      this.sitW * -0.18 + this.airW * -0.15, EASE_RATES.head, dt);    this.easeChannel('frontLeft',
      this.sitW * 0.15 + this.airW * 0.9, EASE_RATES.legs, dt);
    this.easeChannel('frontRight',
      this.sitW * 0.15 + this.airW * 0.9, EASE_RATES.legs, dt);
    this.easeChannel('backLeft',
      this.sitW * hindFold + this.airW * -1.0, EASE_RATES.legs, dt);
    this.easeChannel('backRight',
      this.sitW * hindFold + this.airW * -1.0, EASE_RATES.legs, dt);

    const sitAir = Math.max(this.sitW, this.airW);
    let tailAmpTarget = lerp(
      lerp(0.55, lerp(0.45, 0.5, this.runW), this.gaitW),
      sitAir * 0.38,
      sitAir
    );
    let tailSpeedTarget = lerp(
      lerp(6, lerp(5.2, 8.5, this.runW), this.gaitW),
      4.5,
      this.sitW
    );
    tailAmpTarget = lerp(tailAmpTarget, 0.3, this.sniffW);
    tailSpeedTarget = lerp(tailSpeedTarget, 3.4, this.sniffW);
    tailAmpTarget = lerp(tailAmpTarget, 0.85, this.greetW);
    tailSpeedTarget = lerp(tailSpeedTarget, 11, this.greetW);
    this.easeChannel('tailAmp', tailAmpTarget, EASE_RATES.torso, dt);
    this.easeChannel('tailSpeed', tailSpeedTarget, EASE_RATES.torso, dt);
    this.tailPhase += dt * this.channels.tailSpeed;

    const walkAmp = 0.6 * clamp01(speed / TUNING.walkSpeed);
    const runAmp = 0.85;
    const s = Math.sin(this.phase);
    const walkSwing = {
      frontLeft: s,
      frontRight: -s,
      backLeft: -s,
      backRight: s
    };
    const runSwing = {
      frontLeft: Math.sin(this.phase - 0.15) * runAmp,
      frontRight: Math.sin(this.phase + 0.15) * runAmp,
      backLeft: Math.sin(this.phase + Math.PI - 0.15) * runAmp,
      backRight: Math.sin(this.phase + Math.PI + 0.15) * runAmp
    };
    const pitchOsc = lerp(
      Math.sin(this.phase * 2 + 0.4) * 0.02,
      Math.sin(this.phase + 0.55) * 0.11,
      this.runW
    ) * this.gaitW;
    const liftOsc = lerp(
      Math.sin(this.phase * 2) * 0.015,
      Math.sin(this.phase + 0.9) * 0.055,
      this.runW
    ) * this.gaitW;
    const headOsc = Math.sin(this.phase * 2 + 0.9) * 0.03 * this.gaitW * (1 - this.runW * 0.5);
    const breathe = Math.sin(this.elapsed * 2.4) * 0.02 * (1 - this.gaitW) * (1 - this.sitW * 0.4);
    const idleHead = Math.sin(this.elapsed * 2.4 + 0.9) * 0.05 * (1 - this.gaitW);
    const barkEnv = this.barkTimer > 0 ? this.barkTimer / BARK_DURATION : 0;
    const carryDipEnv = this.carryDipTimer > 0 ? this.carryDipTimer / CARRY_DIP_DURATION : 0;
    const carryDip = (0.32 + Math.sin(this.carryDipTimer * 18) * 0.06) * carryDipEnv;
    const sniffBob = Math.sin(this.elapsed * 7.2) * 0.1 * this.sniffW;
    const sniffDip = (0.58 + sniffBob) * this.sniffW;
    const greetDip = 0.3 * this.greetW;

    const c = this.channels;
    const parts = this.parts;
    parts.torso.rotation.x = c.torsoPitch + pitchOsc - 0.09 * barkEnv
      + 0.13 * this.sniffW + 0.05 * this.greetW;
    parts.torso.position.y = parts.torso.userData.baseY + c.torsoLift + liftOsc + breathe
      - 0.07 * this.sniffW - 0.02 * this.greetW;
    parts.head.rotation.x = c.headPitch + headOsc + idleHead - 0.55 * barkEnv
      + sniffDip + greetDip + carryDip + 0.26 * this.carryW;
    parts.tail.rotation.y = Math.sin(this.tailPhase) * c.tailAmp;

    for (const name of ['frontLeft', 'frontRight', 'backLeft', 'backRight']) {
      const swing = lerp(walkSwing[name] * walkAmp, runSwing[name], this.runW) * this.gaitW;
      parts.legPivots[name].rotation.x = c[name] + swing;
    }
  }
}
