import * as THREE from 'three';

const DEFAULT_PARAMS = {
  name: 'Doggo',
  tagline: 'a good dog',
  bodyLength: 1,
  bodyHeight: 0.5,
  bodyWidth: 0.45,
  legLength: 0.4,
  legRadius: 0.085,
  headSize: 0.42,
  snoutScale: 1,
  earStyle: 'pointed',
  earScale: 1,
  tailStyle: 'straight',
  tailScale: 1,
  bodyColor: 0xe0913f,
  bellyColor: 0xf7e6c4,
  earColor: 0xd9873c,
  tailColor: 0xe0913f,
  eyeColor: 0x2e2420,
  noseColor: 0x322622
};

export const DOG_PRESETS = [
  {
    name: 'Mochi',
    tagline: 'the speedy shiba',
    bodyLength: 0.92,
    bodyHeight: 0.52,
    bodyWidth: 0.46,
    legLength: 0.5,
    legRadius: 0.085,
    headSize: 0.44,
    snoutScale: 0.85,
    earStyle: 'pointed',
    earScale: 0.85,
    tailStyle: 'curled',
    tailScale: 1,
    bodyColor: 0xe0913f,
    bellyColor: 0xf7e6c4,
    earColor: 0xd9873c,
    tailColor: 0xe0913f,
    eyeColor: 0x2e2420,
    noseColor: 0x322622
  },
  {
    name: 'Blueberry',
    tagline: 'the stalwart corgi',
    bodyLength: 1.24,
    bodyHeight: 0.48,
    bodyWidth: 0.44,
    legLength: 0.3,
    legRadius: 0.09,
    headSize: 0.42,
    snoutScale: 1.05,
    earStyle: 'rounded',
    earScale: 1.4,
    tailStyle: 'straight',
    tailScale: 0.85,
    bodyColor: 0x91a8c8,
    bellyColor: 0xf3f6fa,
    earColor: 0x7c92b4,
    tailColor: 0x91a8c8,
    eyeColor: 0x232b36,
    noseColor: 0x2b323d
  }
];

function material(color) {
  return new THREE.MeshStandardMaterial({ color, flatShading: true, roughness: 0.85, metalness: 0 });
}

function pointedEars(headSize, scale, color) {
  const ears = new THREE.Group();
  const geometry = new THREE.ConeGeometry(headSize * 0.22 * scale, headSize * 0.45 * scale, 4);
  for (const side of [-1, 1]) {
    const ear = new THREE.Mesh(geometry, material(color));
    ear.position.set(side * headSize * 0.34, headSize * 0.55, 0);
    ear.rotation.z = -side * 0.24;
    ear.rotation.y = Math.PI / 4;
    ears.add(ear);
  }
  return ears;
}

function roundedEars(headSize, scale, color) {
  const ears = new THREE.Group();
  const geometry = new THREE.SphereGeometry(headSize * 0.2 * scale, 8, 6);
  for (const side of [-1, 1]) {
    const ear = new THREE.Mesh(geometry, material(color));
    ear.scale.set(1, 1.9, 0.9);
    ear.position.set(side * headSize * 0.38, headSize * 0.6, 0);
    ear.rotation.z = -side * 0.16;
    ears.add(ear);
  }
  return ears;
}

function curledTail(bodyHeight, scale, color) {
  const pivot = new THREE.Group();
  const radius = bodyHeight * 0.34 * scale;
  const tail = new THREE.Mesh(new THREE.TorusGeometry(radius, radius * 0.42, 8, 14), material(color));
  tail.rotation.y = Math.PI / 2;
  tail.position.set(0, radius * 0.9, -radius * 0.2);
  pivot.add(tail);
  return pivot;
}

function straightTail(bodyLength, bodyHeight, scale, color) {
  const pivot = new THREE.Group();
  const length = bodyLength * 0.42 * scale;
  const tail = new THREE.Mesh(new THREE.ConeGeometry(bodyHeight * 0.13, length, 7), material(color));
  tail.rotation.x = -0.85;
  tail.position.set(0, length * 0.33, -length * 0.37);
  pivot.add(tail);
  return pivot;
}

function buildHead(params) {
  const hs = params.headSize;
  const head = new THREE.Group();

  const skull = new THREE.Mesh(new THREE.BoxGeometry(hs, hs * 0.92, hs * 0.95), material(params.bodyColor));
  head.add(skull);

  const snoutLength = hs * 0.5 * params.snoutScale;
  const snout = new THREE.Mesh(
    new THREE.BoxGeometry(hs * 0.44, hs * 0.34, snoutLength),
    material(params.bellyColor)
  );
  snout.position.set(0, -hs * 0.16, hs * 0.4 + snoutLength / 2);
  head.add(snout);

  const nose = new THREE.Mesh(new THREE.BoxGeometry(hs * 0.18, hs * 0.14, hs * 0.12), material(params.noseColor));
  nose.position.set(0, -hs * 0.1, snout.position.z + snoutLength / 2 + hs * 0.05);
  head.add(nose);

  const eyeGeometry = new THREE.SphereGeometry(hs * 0.075, 7, 5);
  for (const side of [-1, 1]) {
    const eye = new THREE.Mesh(eyeGeometry, material(params.eyeColor));
    eye.position.set(side * hs * 0.24, hs * 0.1, hs * 0.44);
    head.add(eye);
  }

  const ears = params.earStyle === 'pointed'
    ? pointedEars(hs, params.earScale, params.earColor)
    : roundedEars(hs, params.earScale, params.earColor);
  head.add(ears);

  return head;
}

function buildLegs(params) {
  const legs = new THREE.Group();
  const legHeight = params.legLength + params.bodyHeight * 0.35;
  const legGeometry = new THREE.CylinderGeometry(params.legRadius, params.legRadius * 1.08, legHeight, 7);
  const pawGeometry = new THREE.SphereGeometry(params.legRadius * 1.35, 7, 5);
  const pivots = {};
  const legNames = {
    '1,1': 'frontLeft',
    '-1,1': 'frontRight',
    '1,-1': 'backLeft',
    '-1,-1': 'backRight'
  };
  for (const xSide of [-1, 1]) {
    for (const zSide of [-1, 1]) {
      const name = legNames[`${xSide},${zSide}`];
      const x = xSide * (params.bodyWidth / 2 - params.legRadius * 1.1);
      const z = zSide * (params.bodyLength / 2 - params.legRadius * 1.7);
      const pivot = new THREE.Group();
      pivot.name = `leg-${name}`;
      pivot.position.set(x, legHeight, z);
      pivot.userData.baseX = x;
      pivot.userData.baseZ = z;
      const leg = new THREE.Mesh(legGeometry, material(params.bodyColor));
      leg.position.set(0, -legHeight / 2, 0);
      const paw = new THREE.Mesh(pawGeometry, material(params.bellyColor));
      paw.scale.set(1, 0.75, 1.15);
      paw.position.set(0, -(legHeight - params.legRadius * 0.6), zSide * params.legRadius * 0.3);
      pivot.add(leg, paw);
      legs.add(pivot);
      pivots[name] = pivot;
    }
  }
  return { group: legs, pivots };
}

export function createDog(params) {
  const p = { ...DEFAULT_PARAMS, ...params };
  const dog = new THREE.Group();
  dog.name = p.name;

  const torsoCenterY = p.legLength + p.bodyHeight / 2;
  const torso = new THREE.Group();
  torso.position.y = torsoCenterY;
  torso.userData.baseY = torsoCenterY;

  const body = new THREE.Mesh(
    new THREE.BoxGeometry(p.bodyWidth, p.bodyHeight, p.bodyLength),
    material(p.bodyColor)
  );
  torso.add(body);

  const belly = new THREE.Mesh(
    new THREE.BoxGeometry(p.bodyWidth * 1.08, p.bodyHeight * 0.66, p.bodyLength * 0.72),
    material(p.bellyColor)
  );
  belly.position.set(0, -p.bodyHeight * 0.22, p.bodyLength * 0.06);
  torso.add(belly);

  const head = buildHead(p);
  head.position.set(0, p.bodyHeight * 0.32, p.bodyLength / 2 + p.headSize * 0.42);
  torso.add(head);

  const tail = p.tailStyle === 'curled'
    ? curledTail(p.bodyHeight, p.tailScale, p.tailColor)
    : straightTail(p.bodyLength, p.bodyHeight, p.tailScale, p.tailColor);
  tail.position.set(0, p.bodyHeight * 0.24, -p.bodyLength / 2 + p.bodyWidth * 0.06);
  torso.add(tail);

  const { group: legs, pivots: legPivots } = buildLegs(p);

  dog.add(torso, legs);
  dog.userData = {
    name: p.name,
    tagline: p.tagline,
    params: p,
    parts: { torso, head, tail, legs, legPivots }
  };
  return dog;
}

export function disposeDog(dog) {
  dog.traverse((object) => {
    if (object.isMesh) {
      object.geometry.dispose();
      object.material.dispose();
    }
  });
}
