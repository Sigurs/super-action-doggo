import * as THREE from 'three';
import { createDog, disposeDog } from './dog-builder.js';
import { DogAnimator } from './anim.js';
import { applyParkClamp } from './park-clamp.js';
import { TUNING } from './dog-controller.js';

export const NPC_DOG_PRESETS = [
  {
    name: 'Biscuit',
    tagline: 'the mellow greeter',
    bodyLength: 1.34,
    bodyHeight: 0.56,
    bodyWidth: 0.5,
    legLength: 0.54,
    legRadius: 0.095,
    headSize: 0.46,
    snoutScale: 1.1,
    earStyle: 'rounded',
    earScale: 0.85,
    tailStyle: 'straight',
    tailScale: 1.25,
    bodyColor: 0xa9784c,
    bellyColor: 0xe9d6ae,
    earColor: 0x8d5f3b,
    tailColor: 0xa9784c,
    eyeColor: 0x2e2420,
    noseColor: 0x322622
  },
  {
    name: 'Pepper',
    tagline: 'the park sentinel',
    bodyLength: 1.0,
    bodyHeight: 0.52,
    bodyWidth: 0.47,
    legLength: 0.42,
    legRadius: 0.09,
    headSize: 0.44,
    snoutScale: 0.95,
    earStyle: 'pointed',
    earScale: 1.1,
    tailStyle: 'curled',
    tailScale: 0.9,
    bodyColor: 0x535863,
    bellyColor: 0x9ba1ac,
    earColor: 0x434853,
    tailColor: 0x535863,
    eyeColor: 0x1d222b,
    noseColor: 0x262b33
  },
  {
    name: 'Basil',
    tagline: 'the tiny cloud',
    bodyLength: 0.72,
    bodyHeight: 0.44,
    bodyWidth: 0.4,
    legLength: 0.3,
    legRadius: 0.075,
    headSize: 0.4,
    snoutScale: 0.8,
    earStyle: 'pointed',
    earScale: 1.35,
    tailStyle: 'straight',
    tailScale: 1.0,
    bodyColor: 0xf2ead8,
    bellyColor: 0xfbf5e8,
    earColor: 0xe0d0b0,
    tailColor: 0xf2ead8,
    eyeColor: 0x33291f,
    noseColor: 0x3a2d26
  }
];

const SPAWNS = [
  { x: -7, z: -3 },
  { x: 11, z: 6 },
  { x: -5, z: 10 }
];

const TUNE = {
  walkSpeed: 1.5,
  turnRate: 6,
  pauseMin: 0.9,
  pauseMax: 2.4,
  sniffChance: 0.5,
  sniffMin: 1.2,
  sniffMax: 2.8,
  targetMargin: 2.4,
  colliderClearance: 0.5,
  targetMinDistance: 3,
  arriveDistance: 0.4,
  stuckTime: 1.3,
  greetDuration: 1.9,
  greetCooldown: 25,
  greetTurnRate: 8
};

const wrapAngle = (angle) => Math.atan2(Math.sin(angle), Math.cos(angle));

const easeAngle = (current, target, rate, dt) => {
  const step = rate * dt;
  let delta = wrapAngle(target - current);
  if (delta > step) {
    delta = step;
  } else if (delta < -step) {
    delta = -step;
  }
  return wrapAngle(current + delta);
};

const randomBetween = (min, max) => min + Math.random() * (max - min);

function createAgent(preset, spawn, park) {
  const dog = createDog(preset);
  dog.traverse((object) => {
    if (object.isMesh) {
      object.castShadow = true;
    }
  });
  return {
    dog,
    animator: new DogAnimator(dog),
    park,
    preset,
    spawn,
    x: spawn.x,
    z: spawn.z,
    yaw: Math.random() * Math.PI * 2,
    state: 'pause',
    timer: randomBetween(TUNE.pauseMin, TUNE.pauseMax),
    targetX: spawn.x,
    targetZ: spawn.z,
    lastX: spawn.x,
    lastZ: spawn.z,
    stuckTimer: 0,
    cooldown: 0,
    greetTimer: 0
  };
}

function insideCollider(park, x, z, clearance) {
  for (const collider of park.colliders) {
    const dx = x - collider.x;
    const dz = z - collider.z;
    const minDistance = collider.radius + TUNING.dogRadius + clearance;
    if (dx * dx + dz * dz < minDistance * minDistance) {
      return true;
    }
  }
  return false;
}

function pickWanderTarget(npc) {
  const maxRadius = npc.park.radius - TUNE.targetMargin;
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.sqrt(Math.random()) * maxRadius;
    const x = Math.sin(angle) * radius;
    const z = Math.cos(angle) * radius;
    const farEnough = Math.hypot(x - npc.x, z - npc.z) >= TUNE.targetMinDistance;
    if (farEnough && !insideCollider(npc.park, x, z, TUNE.colliderClearance)) {
      npc.targetX = x;
      npc.targetZ = z;
      return;
    }
  }
  npc.targetX = -npc.x * 0.5;
  npc.targetZ = -npc.z * 0.5;
}

export function createNpcDogs(park) {
  const group = new THREE.Group();
  group.name = 'npc-dogs';
  const npcs = NPC_DOG_PRESETS.map((preset, index) => {
    const npc = createAgent(preset, SPAWNS[index % SPAWNS.length], park);
    group.add(npc.dog);
    return npc;
  });

  const animatorState = { locomotion: 'idle', speed: 0, grounded: true, greeting: false };

  const update = (dt, player) => {
    for (const npc of npcs) {
      npc.cooldown = Math.max(0, npc.cooldown - dt);
      let moving = false;
      animatorState.greeting = false;

      if (npc.state === 'greet') {
        npc.greetTimer -= dt;
        const dx = player.x - npc.x;
        const dz = player.z - npc.z;
        if (dx * dx + dz * dz > 1e-4) {
          npc.yaw = easeAngle(npc.yaw, Math.atan2(dx, dz), TUNE.greetTurnRate, dt);
        }
        animatorState.greeting = true;
        if (npc.greetTimer <= 0) {
          npc.state = 'pause';
          npc.timer = randomBetween(TUNE.pauseMin, TUNE.pauseMax);
        }
      } else if (npc.state === 'walk') {
        const dx = npc.targetX - npc.x;
        const dz = npc.targetZ - npc.z;
        if (Math.hypot(dx, dz) < TUNE.arriveDistance) {
          npc.state = Math.random() < TUNE.sniffChance ? 'sniff' : 'pause';
          npc.timer = npc.state === 'sniff'
            ? randomBetween(TUNE.sniffMin, TUNE.sniffMax)
            : randomBetween(TUNE.pauseMin, TUNE.pauseMax);
        } else {
          npc.yaw = easeAngle(npc.yaw, Math.atan2(dx, dz), TUNE.turnRate, dt);
          npc.x += Math.sin(npc.yaw) * TUNE.walkSpeed * dt;
          npc.z += Math.cos(npc.yaw) * TUNE.walkSpeed * dt;
          moving = true;
        }
      } else {
        npc.timer -= dt;
        if (npc.timer <= 0) {
          pickWanderTarget(npc);
          npc.state = 'walk';
        }
      }

      applyParkClamp(npc, TUNING.dogRadius, npc.park);

      if (npc.state === 'walk') {
        const moved = Math.hypot(npc.x - npc.lastX, npc.z - npc.lastZ);
        if (moving && moved < TUNE.walkSpeed * dt * 0.25) {
          npc.stuckTimer += dt;
        } else {
          npc.stuckTimer = 0;
        }
        if (npc.stuckTimer > TUNE.stuckTime) {
          pickWanderTarget(npc);
          npc.stuckTimer = 0;
        }
      } else {
        npc.stuckTimer = 0;
      }
      npc.lastX = npc.x;
      npc.lastZ = npc.z;

      npc.dog.position.set(npc.x, 0, npc.z);
      npc.dog.rotation.y = npc.yaw;

      animatorState.locomotion = moving
        ? 'walk'
        : (npc.state === 'sniff' ? 'sniff' : 'idle');
      animatorState.speed = moving ? TUNE.walkSpeed : 0;
      npc.animator.update(dt, animatorState);
    }
  };

  const nearest = (position, maxDistance) => {
    let best = null;
    let bestSquared = maxDistance * maxDistance;
    for (const npc of npcs) {
      const dx = npc.x - position.x;
      const dz = npc.z - position.z;
      const squared = dx * dx + dz * dz;
      if (squared < bestSquared) {
        best = npc;
        bestSquared = squared;
      }
    }
    return best;
  };

  const tryGreet = (npc) => {
    if (npc.state === 'greet') {
      return false;
    }
    npc.state = 'greet';
    npc.greetTimer = TUNE.greetDuration;
    const counts = npc.cooldown <= 0;
    if (counts) {
      npc.cooldown = TUNE.greetCooldown;
    }
    return counts;
  };

  const cancelGreet = (npc) => {
    if (npc.state === 'greet') {
      npc.state = 'pause';
      npc.timer = 0.6;
    }
  };

  const reset = () => {
    for (const npc of npcs) {
      npc.x = npc.spawn.x;
      npc.z = npc.spawn.z;
      npc.yaw = Math.random() * Math.PI * 2;
      npc.state = 'pause';
      npc.timer = randomBetween(TUNE.pauseMin, TUNE.pauseMax);
      npc.targetX = npc.spawn.x;
      npc.targetZ = npc.spawn.z;
      npc.lastX = npc.spawn.x;
      npc.lastZ = npc.spawn.z;
      npc.stuckTimer = 0;
      npc.cooldown = 0;
      npc.greetTimer = 0;
      npc.dog.position.set(npc.x, 0, npc.z);
      npc.dog.rotation.y = npc.yaw;
    }
  };

  const dispose = () => {
    for (const npc of npcs) {
      disposeDog(npc.dog);
    }
  };

  return { group, npcs, update, nearest, tryGreet, cancelGreet, reset, dispose };
}
