export const TUNING = {
  walkSpeed: 2.2,
  runSpeed: 4.5,
  gravity: -20,
  jumpVelocity: 4.5,
  acceleration: 10,
  turnRate: 11,
  dogRadius: 0.34,
  boundaryMargin: 0.6
};

const MOVEMENT_CODES = {
  KeyW: 'forward',
  ArrowUp: 'forward',
  KeyS: 'back',
  ArrowDown: 'back',
  KeyA: 'left',
  ArrowLeft: 'left',
  KeyD: 'right',
  ArrowRight: 'right'
};

const GAME_CODES = new Set([
  ...Object.keys(MOVEMENT_CODES),
  'Space',
  'ShiftLeft',
  'ShiftRight',
  'KeyC',
  'KeyB'
]);

const wrapAngle = (angle) => Math.atan2(Math.sin(angle), Math.cos(angle));

export class DogController {
  constructor(dog, park) {
    this.dog = dog;
    this.radius = park.radius;
    this.colliders = park.colliders;
    this.keys = new Set();
    this.jumpQueued = false;
    this.barkQueued = false;
    this.attached = false;
    this.onKeyDown = (event) => {
      if (!GAME_CODES.has(event.code)) {
        return;
      }
      event.preventDefault();
      if (event.repeat) {
        return;
      }
      this.keys.add(event.code);
      if (event.code === 'Space') {
        this.jumpQueued = true;
      }
      if (event.code === 'KeyB') {
        this.barkQueued = true;
      }
      if (event.code === 'KeyC' && this.grounded) {
        this.sitting = true;
      }
    };
    this.onKeyUp = (event) => {
      this.keys.delete(event.code);
    };
    this.onBlur = () => {
      this.keys.clear();
    };
    this.reset();
  }

  reset() {
    this.keys.clear();
    this.jumpQueued = false;
    this.barkQueued = false;
    this.x = 0;
    this.y = 0;
    this.z = 0;
    this.vx = 0;
    this.vz = 0;
    this.vy = 0;
    this.yaw = 0;
    this.grounded = true;
    this.sitting = false;
    this.running = false;
    this.speed = 0;
    this.locomotion = 'idle';
  }

  attach() {
    if (this.attached) {
      return;
    }
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('blur', this.onBlur);
    this.attached = true;
  }

  detach() {
    if (!this.attached) {
      return;
    }
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('blur', this.onBlur);
    this.keys.clear();
    this.jumpQueued = false;
    this.barkQueued = false;
    this.attached = false;
  }

  consumeBark() {
    const barked = this.barkQueued;
    this.barkQueued = false;
    return barked;
  }

  readMovementInput() {
    let x = 0;
    let z = 0;
    for (const code of this.keys) {
      const direction = MOVEMENT_CODES[code];
      if (direction === 'forward') {
        z += 1;
      } else if (direction === 'back') {
        z -= 1;
      } else if (direction === 'left') {
        x -= 1;
      } else if (direction === 'right') {
        x += 1;
      }
    }
    return { x, z };
  }

  update(dt, cameraYaw) {
    const input = this.readMovementInput();
    const hasInput = input.x !== 0 || input.z !== 0;
    if (hasInput && this.sitting) {
      this.sitting = false;
    }
    this.running = hasInput && (this.keys.has('ShiftLeft') || this.keys.has('ShiftRight'));

    let targetVx = 0;
    let targetVz = 0;
    if (hasInput && !this.sitting) {
      const length = Math.hypot(input.x, input.z);
      const ix = input.x / length;
      const iz = input.z / length;
      const forwardX = -Math.sin(cameraYaw);
      const forwardZ = -Math.cos(cameraYaw);
      const rightX = -forwardZ;
      const rightZ = forwardX;
      const targetSpeed = this.running ? TUNING.runSpeed : TUNING.walkSpeed;
      targetVx = (forwardX * iz + rightX * ix) * targetSpeed;
      targetVz = (forwardZ * iz + rightZ * ix) * targetSpeed;
    }

    const blend = 1 - Math.exp(-TUNING.acceleration * dt);
    this.vx += (targetVx - this.vx) * blend;
    this.vz += (targetVz - this.vz) * blend;

    if (this.jumpQueued) {
      this.jumpQueued = false;
      if (this.grounded && !this.sitting) {
        this.vy = TUNING.jumpVelocity;
        this.grounded = false;
      }
    }
    if (!this.grounded) {
      this.vy += TUNING.gravity * dt;
      this.y += this.vy * dt;
      if (this.y <= 0) {
        this.y = 0;
        this.vy = 0;
        this.grounded = true;
      }
    }

    this.x += this.vx * dt;
    this.z += this.vz * dt;
    this.speed = Math.hypot(this.vx, this.vz);

    const maxRadius = this.radius - TUNING.boundaryMargin;
    const distance = Math.hypot(this.x, this.z);
    if (distance > maxRadius) {
      this.x = (this.x / distance) * maxRadius;
      this.z = (this.z / distance) * maxRadius;
    }

    for (const collider of this.colliders) {
      const dx = this.x - collider.x;
      const dz = this.z - collider.z;
      const minDistance = collider.radius + TUNING.dogRadius;
      const squared = dx * dx + dz * dz;
      if (squared < minDistance * minDistance && squared > 1e-8) {
        const actual = Math.sqrt(squared);
        this.x = collider.x + (dx / actual) * minDistance;
        this.z = collider.z + (dz / actual) * minDistance;
      }
    }

    if (this.speed > 0.2) {
      const targetYaw = Math.atan2(this.vx, this.vz);
      let delta = wrapAngle(targetYaw - this.yaw);
      const step = TUNING.turnRate * dt;
      if (delta > step) {
        delta = step;
      } else if (delta < -step) {
        delta = -step;
      }
      this.yaw = wrapAngle(this.yaw + delta);
    }

    this.dog.position.set(this.x, this.y, this.z);
    this.dog.rotation.y = this.yaw;

    if (!this.grounded) {
      this.locomotion = 'jump';
    } else if (this.sitting) {
      this.locomotion = 'sit';
    } else if (hasInput || this.speed > 0.25) {
      this.locomotion = this.running ? 'run' : 'walk';
    } else {
      this.locomotion = 'idle';
    }
  }
}
