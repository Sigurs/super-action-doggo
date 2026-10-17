import * as THREE from 'three';
import { TUNING as NEEDS_TUNING } from './needs.js';

const TUNE = {
  walkSpeed: 1.35,
  turnRate: 6.5,
  viewTurnRate: 7,
  pauseChance: 0.35,
  pauseMin: 1.2,
  pauseMax: 4,
  benchChance: 0.45,
  sitMin: 7,
  sitMax: 16,
  arriveDistance: 0.45,
  noticeRange: 4,
  noticeWalkBlend: 0.45,
  noticeSitBlend: 0.6,
  petRange: 1.65,
  petCalmSpeed: 0.65,
  petCalmTime: 1.2,
  petDuration: 2.3,
  petCooldown: 25,
  startleRange: 6,
  startleDuration: 0.95,
  startleStep: 0.55
};

// Canonical rig (scaled per visitor): hips at HIP_Y, feet on the ground.
const HIP_Y = 0.52;
const SIT_HIP_WORLD_Y = 0.59;
const SIT_LEG_PITCH = -1.25;

const RING_RADIUS = 12;
const ringLoop = [];
for (let i = 0; i < 8; i += 1) {
  const angle = (i / 8) * Math.PI * 2;
  ringLoop.push({ x: Math.sin(angle) * RING_RADIUS, z: Math.cos(angle) * RING_RADIUS });
}
const crossLoop = [
  { x: 13, z: 0 }, { x: 0, z: 0 }, { x: 0, z: 13 }, { x: 0, z: 0 },
  { x: -13, z: 0 }, { x: 0, z: 0 }, { x: 0, z: -13 }, { x: 0, z: 0 }
];

const GEOMETRIES = {
  leg: new THREE.BoxGeometry(0.13, 0.5, 0.13),
  arm: new THREE.BoxGeometry(0.1, 0.46, 0.1),
  torso: new THREE.BoxGeometry(0.34, 0.55, 0.2),
  head: new THREE.BoxGeometry(0.2, 0.24, 0.21),
  hair: new THREE.BoxGeometry(0.22, 0.1, 0.23)
};

const materialCache = new Map();
const mat = (color) => {
  let material = materialCache.get(color);
  if (!material) {
    material = new THREE.MeshStandardMaterial({ color, flatShading: true, roughness: 0.9, metalness: 0 });
    materialCache.set(color, material);
  }
  return material;
};

const OUTFITS = [
  { shirt: 0xd6483e, pants: 0x3b4658, skin: 0xf0c8a0, hair: 0x3a2c22 },
  { shirt: 0x4a90d9, pants: 0x5a4a3a, skin: 0xd9a878, hair: 0x22282e },
  { shirt: 0x7bb661, pants: 0x3b4658, skin: 0xc99a6d, hair: 0x6b4a2f },
  { shirt: 0xe8b04b, pants: 0x6b7b8c, skin: 0xf0c8a0, hair: 0x8a8a8a },
  { shirt: 0x9a6db5, pants: 0x46424f, skin: 0xba8a5e, hair: 0x2e2620 }
];

const SCALES = [1.02, 0.94, 1.06, 0.97, 1.04];

const wrapAngle = (angle) => Math.atan2(Math.sin(angle), Math.cos(angle));
const lerp = (a, b, t) => a + (b - a) * t;
const blendAngle = (from, to, weight) => from + wrapAngle(to - from) * weight;

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

function buildVisitor(outfit, scale) {
  const root = new THREE.Group();
  root.scale.setScalar(scale);

  const legPivots = {};
  for (const side of [-1, 1]) {
    const pivot = new THREE.Group();
    pivot.position.set(side * 0.095, HIP_Y, 0);
    const leg = new THREE.Mesh(GEOMETRIES.leg, mat(outfit.pants));
    leg.position.y = -0.25;
    pivot.add(leg);
    root.add(pivot);
    legPivots[side === -1 ? 'left' : 'right'] = pivot;
  }

  const torsoPivot = new THREE.Group();
  torsoPivot.position.y = HIP_Y;
  root.add(torsoPivot);

  const torso = new THREE.Mesh(GEOMETRIES.torso, mat(outfit.shirt));
  torso.position.y = 0.275;
  torsoPivot.add(torso);

  const head = new THREE.Mesh(GEOMETRIES.head, mat(outfit.skin));
  head.position.y = 0.68;
  torsoPivot.add(head);
  const hair = new THREE.Mesh(GEOMETRIES.hair, mat(outfit.hair));
  hair.position.set(0, 0.81, -0.01);
  torsoPivot.add(hair);

  const armPivots = {};
  for (const side of [-1, 1]) {
    const pivot = new THREE.Group();
    pivot.position.set(side * 0.225, 0.46, 0);
    const arm = new THREE.Mesh(GEOMETRIES.arm, mat(outfit.shirt));
    arm.position.y = -0.23;
    pivot.add(arm);
    torsoPivot.add(pivot);
    armPivots[side === -1 ? 'left' : 'right'] = pivot;
  }

  root.traverse((object) => {
    if (object.isMesh) {
      object.castShadow = true;
    }
  });

  return { root, legPivots, armPivots, torsoPivot };
}

function createVisitor(index, benches) {
  const outfit = OUTFITS[index % OUTFITS.length];
  const scale = SCALES[index % SCALES.length];
  const rig = buildVisitor(outfit, scale);
  const usesRing = index < 3;
  const loop = usesRing ? ringLoop : crossLoop;
  const loopIndex = usesRing ? (index * 3) % ringLoop.length : (index - 3) * 4;
  const direction = index % 2 === 0 ? 1 : -1;
  const start = loop[loopIndex];
  return {
    ...rig,
    benches,
    loop,
    loopIndex,
    direction,
    scale,
    x: start.x,
    z: start.z,
    yaw: 0,
    viewYaw: 0,
    state: 'pause',
    timer: randomBetween(TUNE.pauseMin, TUNE.pauseMax),
    bench: null,
    reaction: null,
    reactionTimer: 0,
    petEnv: 0,
    startleEnv: 0,
    startleBaseX: 0,
    startleBaseZ: 0,
    startleDirX: 0,
    startleDirZ: 1,
    calmTimer: 0,
    petCooldown: 0,
    sitW: 0,
    walkW: 0,
    phase: Math.random() * Math.PI * 2,
    clock: Math.random() * 10,
    moving: false,
    sitRootY: SIT_HIP_WORLD_Y - HIP_Y * scale
  };
}

export function createVisitors(park, { onMoodGain }) {
  const group = new THREE.Group();
  group.name = 'visitors';
  const benches = (park.benches || []).map((bench) => ({ ...bench, occupant: null }));
  const visitors = [];
  for (let i = 0; i < 5; i += 1) {
    const visitor = createVisitor(i, benches);
    visitors.push(visitor);
    group.add(visitor.root);
  }

  const claimBench = (visitor) => {
    const free = benches.filter((bench) => !bench.occupant);
    if (free.length === 0) {
      return;
    }
    const bench = free[Math.floor(Math.random() * free.length)];
    bench.occupant = visitor;
    visitor.bench = bench;
    visitor.state = 'toBench';
  };

  const leaveBench = (visitor) => {
    if (visitor.bench) {
      visitor.bench.occupant = null;
      visitor.bench = null;
    }
  };

  const nearestLoopIndex = (visitor) => {
    let best = 0;
    let bestSquared = Infinity;
    for (let i = 0; i < visitor.loop.length; i += 1) {
      const point = visitor.loop[i];
      const dx = point.x - visitor.x;
      const dz = point.z - visitor.z;
      const squared = dx * dx + dz * dz;
      if (squared < bestSquared) {
        bestSquared = squared;
        best = i;
      }
    }
    return best;
  };

  const updateVisitor = (visitor, dt, dog) => {
    visitor.clock += dt;
    visitor.petCooldown = Math.max(0, visitor.petCooldown - dt);
    visitor.moving = false;

    if (visitor.reaction === 'startled') {
      visitor.reactionTimer -= dt;
      const progress = 1 - Math.max(0, visitor.reactionTimer) / TUNE.startleDuration;
      visitor.startleEnv = Math.sin(Math.PI * Math.min(1, Math.max(0, progress)));
      visitor.x = visitor.startleBaseX + visitor.startleDirX * TUNE.startleStep * visitor.startleEnv;
      visitor.z = visitor.startleBaseZ + visitor.startleDirZ * TUNE.startleStep * visitor.startleEnv;
      if (visitor.reactionTimer <= 0) {
        visitor.x = visitor.startleBaseX;
        visitor.z = visitor.startleBaseZ;
        visitor.startleEnv = 0;
        visitor.reaction = null;
      }
    } else if (visitor.reaction === 'pet') {
      visitor.reactionTimer -= dt;
      const progress = 1 - Math.max(0, visitor.reactionTimer) / TUNE.petDuration;
      visitor.petEnv = Math.min(1, Math.sin(Math.PI * Math.min(1, Math.max(0, progress))) * 2.2);
      const dx = dog.x - visitor.x;
      const dz = dog.z - visitor.z;
      if (dx * dx + dz * dz > 1e-4) {
        visitor.viewYaw = easeAngle(visitor.viewYaw, Math.atan2(dx, dz), 10, dt);
      }
      if (visitor.reactionTimer <= 0) {
        visitor.petEnv = 0;
        visitor.reaction = null;
        if (visitor.state === 'walk' || visitor.state === 'toBench') {
          visitor.state = 'pause';
          visitor.timer = 0.5;
        }
      }
    } else {
      if (visitor.state === 'walk' || visitor.state === 'toBench') {
        const target = visitor.state === 'walk' ? visitor.loop[visitor.loopIndex] : visitor.bench;
        const dx = target.x - visitor.x;
        const dz = target.z - visitor.z;
        if (Math.hypot(dx, dz) < TUNE.arriveDistance) {
          if (visitor.state === 'walk') {
            visitor.loopIndex = (visitor.loopIndex + visitor.direction + visitor.loop.length) % visitor.loop.length;
            if (Math.random() < TUNE.pauseChance) {
              visitor.state = 'pause';
              visitor.timer = randomBetween(TUNE.pauseMin, TUNE.pauseMax);
            } else if (Math.random() < TUNE.benchChance) {
              claimBench(visitor);
            }
          } else {
            visitor.state = 'sitting';
            visitor.timer = randomBetween(TUNE.sitMin, TUNE.sitMax);
            visitor.x = visitor.bench.x;
            visitor.z = visitor.bench.z;
            visitor.yaw = visitor.bench.yaw;
          }
        } else {
          visitor.yaw = easeAngle(visitor.yaw, Math.atan2(dx, dz), TUNE.turnRate, dt);
          visitor.x += Math.sin(visitor.yaw) * TUNE.walkSpeed * dt;
          visitor.z += Math.cos(visitor.yaw) * TUNE.walkSpeed * dt;
          visitor.moving = true;
          visitor.phase += dt * (2.0 + TUNE.walkSpeed * 1.9);
        }
      } else if (visitor.state === 'pause') {
        visitor.timer -= dt;
        if (visitor.timer <= 0) {
          visitor.state = 'walk';
        }
      } else if (visitor.state === 'sitting') {
        visitor.timer -= dt;
        if (visitor.timer <= 0) {
          leaveBench(visitor);
          visitor.loopIndex = nearestLoopIndex(visitor);
          visitor.state = 'pause';
          visitor.timer = 1;
        }
      }

      // Pet trigger: a calm dog (grounded and slow) staying close.
      const dogDx = dog.x - visitor.x;
      const dogDz = dog.z - visitor.z;
      const dogDistanceSquared = dogDx * dogDx + dogDz * dogDz;
      const calm = dog.grounded && dog.speed < TUNE.petCalmSpeed;
      if (calm && dogDistanceSquared < TUNE.petRange * TUNE.petRange && visitor.state !== 'toBench') {
        visitor.calmTimer += dt;
      } else {
        visitor.calmTimer = Math.max(0, visitor.calmTimer - dt * 2);
      }
      if (visitor.calmTimer >= TUNE.petCalmTime) {
        visitor.calmTimer = 0;
        visitor.reaction = 'pet';
        visitor.reactionTimer = TUNE.petDuration;
        if (visitor.petCooldown <= 0) {
          visitor.petCooldown = TUNE.petCooldown;
          onMoodGain(NEEDS_TUNING.moodGainPet);
        }
      }
    }

    // Notice: ease the view yaw toward a nearby dog (reactions face on their own).
    if (visitor.reaction !== 'pet') {
      const dx = dog.x - visitor.x;
      const dz = dog.z - visitor.z;
      const noticing = dx * dx + dz * dz < TUNE.noticeRange * TUNE.noticeRange;
      let targetYaw = visitor.yaw;
      if (noticing && visitor.state !== 'toBench') {
        const dogYaw = Math.atan2(dx, dz);
        if (visitor.moving) {
          targetYaw = blendAngle(visitor.yaw, dogYaw, TUNE.noticeWalkBlend);
        } else if (visitor.state === 'sitting') {
          targetYaw = blendAngle(visitor.yaw, dogYaw, TUNE.noticeSitBlend);
        } else {
          targetYaw = dogYaw;
        }
      }
      visitor.viewYaw = easeAngle(visitor.viewYaw, targetYaw, TUNE.viewTurnRate, dt);
    }

    applyPose(visitor, dt);
  };

  const applyPose = (visitor, dt) => {
    visitor.sitW = lerp(visitor.sitW, visitor.state === 'sitting' ? 1 : 0, 1 - Math.exp(-6 * dt));
    visitor.walkW = lerp(visitor.walkW, visitor.moving ? 1 : 0, 1 - Math.exp(-8 * dt));

    const sit = visitor.sitW;
    const walk = visitor.walkW;
    const swing = Math.sin(visitor.phase) * 0.55 * walk;
    const idle = Math.sin(visitor.clock * 0.9) * 0.045;

    let legLeft = swing;
    let legRight = -swing;
    let armLeft = -swing * 0.55 - 0.05 + idle;
    let armRight = swing * 0.55 - 0.05 - idle;
    let torsoPitch = 0.02;

    legLeft = lerp(legLeft, SIT_LEG_PITCH, sit);
    legRight = lerp(legRight, SIT_LEG_PITCH, sit);
    armLeft = lerp(armLeft, -0.35, sit);
    armRight = lerp(armRight, -0.35, sit);
    torsoPitch -= 0.12 * sit;

    if (visitor.reaction === 'pet') {
      const pat = Math.sin(visitor.clock * 7);
      const reachLeft = -0.75 + pat * 0.09;
      const reachRight = -0.95 + pat * 0.2;
      armLeft = lerp(armLeft, reachLeft, visitor.petEnv);
      armRight = lerp(armRight, reachRight, visitor.petEnv);
      torsoPitch += 0.18 * visitor.petEnv;
    }
    if (visitor.reaction === 'startled') {
      armLeft = lerp(armLeft, -2.45, visitor.startleEnv);
      armRight = lerp(armRight, -2.45, visitor.startleEnv);
      torsoPitch -= 0.08 * visitor.startleEnv;
    }

    let rootY = visitor.sitRootY * sit + Math.abs(Math.sin(visitor.phase)) * 0.028 * walk * (1 - sit);

    visitor.legPivots.left.rotation.x = legLeft;
    visitor.legPivots.right.rotation.x = legRight;
    visitor.armPivots.left.rotation.x = armLeft;
    visitor.armPivots.right.rotation.x = armRight;
    visitor.torsoPivot.rotation.x = torsoPitch;
    visitor.root.position.set(visitor.x, rootY, visitor.z);
    visitor.root.rotation.y = visitor.viewYaw;
  };

  const update = (dt, dog) => {
    for (const visitor of visitors) {
      updateVisitor(visitor, dt, dog);
    }
  };

  const onBark = (x, z) => {
    for (const visitor of visitors) {
      if (visitor.reaction === 'startled') {
        continue;
      }
      const dx = visitor.x - x;
      const dz = visitor.z - z;
      const squared = dx * dx + dz * dz;
      if (squared < TUNE.startleRange * TUNE.startleRange) {
        const distance = Math.sqrt(squared) || 1;
        visitor.reaction = 'startled';
        visitor.reactionTimer = TUNE.startleDuration;
        visitor.calmTimer = 0;
        visitor.startleEnv = 0;
        visitor.startleBaseX = visitor.x;
        visitor.startleBaseZ = visitor.z;
        visitor.startleDirX = dx / distance;
        visitor.startleDirZ = dz / distance;
      }
    }
  };

  const reset = () => {
    for (const bench of benches) {
      bench.occupant = null;
    }
    for (const visitor of visitors) {
      leaveBench(visitor);
      visitor.x = visitor.loop[visitor.loopIndex].x;
      visitor.z = visitor.loop[visitor.loopIndex].z;
      visitor.yaw = 0;
      visitor.viewYaw = 0;
      visitor.state = 'pause';
      visitor.timer = randomBetween(TUNE.pauseMin, TUNE.pauseMax);
      visitor.reaction = null;
      visitor.reactionTimer = 0;
      visitor.petEnv = 0;
      visitor.startleEnv = 0;
      visitor.calmTimer = 0;
      visitor.petCooldown = 0;
      visitor.sitW = 0;
      visitor.walkW = 0;
      visitor.moving = false;
    }
  };

  return { group, visitors, update, onBark, reset };
}
