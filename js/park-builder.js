import * as THREE from 'three';

export const PARK_RADIUS = 30;
const GROUND_RADIUS = 36;
const RING_PATH_INNER = 10.5;
const RING_PATH_OUTER = 13.5;
const PATH_HALF_WIDTH = 1.2;
const FENCE_POSTS = 44;

function createPalette(tracker) {
  const cache = new Map();
  return (color) => {
    let material = cache.get(color);
    if (!material) {
      material = new THREE.MeshStandardMaterial({ color, flatShading: true, roughness: 0.9, metalness: 0 });
      cache.set(color, material);
      tracker.materials.push(material);
    }
    return material;
  };
}

export function createPark() {
  const group = new THREE.Group();
  group.name = 'park';
  const colliders = [];
  const tracker = { materials: [] };
  const mat = createPalette(tracker);

  const addCollider = (x, z, radius) => colliders.push({ x, z, radius });

  const place = (mesh, x, y, z, castShadow = true) => {
    mesh.position.set(x, y, z);
    mesh.castShadow = castShadow;
    group.add(mesh);
    return mesh;
  };

  const polar = (angle, radius) => ({ x: Math.sin(angle) * radius, z: Math.cos(angle) * radius });

  // Ground and paths
  const ground = new THREE.Mesh(new THREE.CircleGeometry(GROUND_RADIUS, 48), mat(0x7fce6b));
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  group.add(ground);

  const ringPath = new THREE.Mesh(new THREE.RingGeometry(RING_PATH_INNER, RING_PATH_OUTER, 64), mat(0xdecf9e));
  ringPath.rotation.x = -Math.PI / 2;
  ringPath.position.y = 0.02;
  ringPath.receiveShadow = true;
  group.add(ringPath);

  const pathAlongX = new THREE.Mesh(
    new THREE.PlaneGeometry(RING_PATH_OUTER * 2, PATH_HALF_WIDTH * 2),
    mat(0xdecf9e)
  );
  pathAlongX.rotation.x = -Math.PI / 2;
  pathAlongX.position.y = 0.024;
  pathAlongX.receiveShadow = true;
  group.add(pathAlongX);

  const pathAlongZ = new THREE.Mesh(
    new THREE.PlaneGeometry(PATH_HALF_WIDTH * 2, RING_PATH_OUTER * 2),
    mat(0xdecf9e)
  );
  pathAlongZ.rotation.x = -Math.PI / 2;
  pathAlongZ.position.y = 0.026;
  pathAlongZ.receiveShadow = true;
  group.add(pathAlongZ);

  const plaza = new THREE.Mesh(new THREE.CircleGeometry(3.4, 24), mat(0xe6d7a8));
  plaza.rotation.x = -Math.PI / 2;
  plaza.position.y = 0.03;
  plaza.receiveShadow = true;
  group.add(plaza);

  // Trees
  const trunkGeometry = new THREE.CylinderGeometry(0.18, 0.26, 1.5, 7);
  const pineConeGeometry = new THREE.ConeGeometry(1.25, 1.7, 7);
  const pineTipGeometry = new THREE.ConeGeometry(0.9, 1.4, 7);
  const blobGeometry = new THREE.IcosahedronGeometry(1.15, 0);
  const treeVariants = [
    { color: 0x4d9450, build(parts, material) {
      parts.push([trunkGeometry, material, 0, 0.75, 0, 1, 1, 1]);
      parts.push([pineConeGeometry, material, 0, 2.05, 0, 1, 1, 1]);
      parts.push([pineConeGeometry, material, 0, 2.95, 0, 0.75, 0.85, 0.75]);
      parts.push([pineTipGeometry, material, 0, 3.8, 0, 0.62, 0.85, 0.62]);
    } },
    { color: 0x5fae52, build(parts, material) {
      parts.push([trunkGeometry, material, 0, 0.75, 0, 1, 1.15, 1]);
      parts.push([blobGeometry, material, 0, 2.35, 0, 1, 0.95, 1]);
      parts.push([blobGeometry, material, 0.55, 1.95, 0.35, 0.55, 0.5, 0.55]);
      parts.push([blobGeometry, material, -0.5, 2.7, -0.3, 0.45, 0.4, 0.45]);
    } },
    { color: 0x77c05e, build(parts, material) {
      parts.push([trunkGeometry, material, 0, 0.9, 0, 0.8, 1.35, 0.8]);
      parts.push([pineConeGeometry, material, 0, 2.5, 0, 0.7, 1.1, 0.7]);
      parts.push([pineTipGeometry, material, 0, 3.45, 0, 0.5, 0.95, 0.5]);
    } }
  ];

  const addTree = (angle, radius, variant, scale) => {
    const { x, z } = polar(angle, radius);
    const tree = new THREE.Group();
    const parts = [];
    const definition = treeVariants[variant];
    definition.build(parts, mat(definition.color));
    for (const [geometry, material, px, py, pz, sx, sy, sz] of parts) {
      const part = new THREE.Mesh(geometry, material);
      part.position.set(px, py, pz);
      part.scale.set(sx, sy, sz);
      part.castShadow = true;
      tree.add(part);
    }
    tree.scale.setScalar(scale);
    tree.position.set(x, 0, z);
    tree.rotation.y = (x * 12.9898 + z * 78.233) % (Math.PI * 2);
    group.add(tree);
    addCollider(x, z, 0.5 * scale + 0.1);
  };

  const innerTrees = [
    [0.45, 8.2, 0, 1.0], [1.05, 6.4, 1, 0.9], [1.9, 8.6, 2, 1.05],
    [2.45, 8.6, 0, 0.85], [2.7, 6.6, 1, 1.0], [3.85, 8.9, 2, 0.95],
    [4.3, 6.2, 0, 1.1], [5.25, 8.8, 1, 0.9], [5.95, 7.1, 2, 1.0]
  ];
  for (const [angle, radius, variant, scale] of innerTrees) {
    addTree(angle, radius, variant, scale);
  }

  const outerTrees = [
    [0.35, 18.5, 1, 1.2], [0.9, 24, 0, 1.1], [1.5, 27.5, 2, 1.0],
    [2.2, 16.8, 0, 0.95], [2.9, 22.5, 1, 1.25], [3.5, 27, 0, 1.05],
    [4.1, 17.5, 2, 1.0], [4.7, 25.5, 1, 1.15], [5.4, 20, 0, 0.9],
    [6.05, 26.5, 2, 1.1], [0.15, 27.8, 1, 1.0], [3.2, 19.5, 1, 0.85]
  ];
  for (const [angle, radius, variant, scale] of outerTrees) {
    addTree(angle, radius, variant, scale);
  }

  // Benches facing the center
  const benchSeatGeometry = new THREE.BoxGeometry(1.7, 0.09, 0.5);
  const benchBackGeometry = new THREE.BoxGeometry(1.7, 0.5, 0.07);
  const benchLegGeometry = new THREE.BoxGeometry(0.09, 0.48, 0.45);
  const benchWood = mat(0xa07a4c);
  const benchDark = mat(0x5a4a3a);
  for (const angle of [0.8, 2.35, 3.9, 5.5]) {
    const { x, z } = polar(angle, RING_PATH_OUTER + 1.6);
    const bench = new THREE.Group();
    const seat = new THREE.Mesh(benchSeatGeometry, benchWood);
    seat.position.y = 0.48;
    const back = new THREE.Mesh(benchBackGeometry, benchWood);
    back.position.set(0, 0.78, -0.26);
    back.rotation.x = -0.14;
    bench.add(seat, back);
    for (const side of [-1, 1]) {
      const leg = new THREE.Mesh(benchLegGeometry, benchDark);
      leg.position.set(side * 0.72, 0.24, 0);
      bench.add(leg);
    }
    bench.traverse((object) => {
      if (object.isMesh) object.castShadow = true;
    });
    bench.position.set(x, 0, z);
    bench.rotation.y = angle + Math.PI;
    group.add(bench);
    addCollider(x, z, 0.95);
  }

  // Bushes (walk-through decoration)
  const bushGeometry = new THREE.IcosahedronGeometry(0.55, 0);
  const bushMaterial = mat(0x55a24a);
  const bushes = [
    [0.55, 5.2, 1.0], [1.45, 9.2, 0.8], [2.35, 5.6, 1.1], [3.25, 7.9, 0.9],
    [4.15, 5.9, 1.05], [5.05, 8.2, 0.85], [5.95, 6.1, 0.95], [2.0, 17.5, 1.2],
    [3.7, 21.5, 1.0], [5.6, 25, 1.15], [1.1, 26.8, 0.9], [4.85, 17.2, 0.8]
  ];
  for (const [angle, radius, scale] of bushes) {
    const { x, z } = polar(angle, radius);
    const bush = new THREE.Mesh(bushGeometry, bushMaterial);
    bush.scale.set(scale, scale * 0.8, scale);
    bush.rotation.y = angle * 3;
    place(bush, x, 0.4 * scale, z);
  }

  // Rocks
  const rockGeometry = new THREE.IcosahedronGeometry(1, 0);
  const rockMaterial = mat(0x9aa0a6);
  const rocks = [
    [5.5, -7.5, 0.75, 0.4], [-10.5, 4.5, 0.55, 0.35], [14, -19, 0.6, 0.5]
  ];
  for (const [x, z, scale, yOffset] of rocks) {
    const rock = new THREE.Mesh(rockGeometry, rockMaterial);
    rock.scale.set(scale, scale * 0.8, scale * 1.1);
    rock.rotation.y = x + z;
    place(rock, x, scale * yOffset, z);
    addCollider(x, z, scale + 0.1);
  }

  // Fire hydrant
  const hydrant = new THREE.Group();
  const hydrantRed = mat(0xd6483e);
  const hydrantDark = mat(0xb53a32);
  const hydrantBase = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.33, 0.14, 9), hydrantDark);
  hydrantBase.position.y = 0.07;
  const hydrantBody = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.2, 0.6, 9), hydrantRed);
  hydrantBody.position.y = 0.44;
  const hydrantDome = new THREE.Mesh(new THREE.SphereGeometry(0.17, 9, 6), hydrantRed);
  hydrantDome.scale.y = 0.75;
  hydrantDome.position.y = 0.78;
  const hydrantCap = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.1, 7), hydrantDark);
  hydrantCap.position.y = 0.9;
  hydrant.add(hydrantBase, hydrantBody, hydrantDome, hydrantCap);
  const nubGeometry = new THREE.CylinderGeometry(0.06, 0.06, 0.22, 7);
  for (const side of [-1, 1]) {
    const nub = new THREE.Mesh(nubGeometry, hydrantDark);
    nub.rotation.z = Math.PI / 2;
    nub.position.set(side * 0.22, 0.54, 0);
    hydrant.add(nub);
  }
  hydrant.traverse((object) => {
    if (object.isMesh) object.castShadow = true;
  });
  hydrant.position.set(3.4, 0, 3.4);
  group.add(hydrant);
  addCollider(3.4, 3.4, 0.35);

  // Fence ring marking the boundary
  const fenceMaterial = mat(0xe9e3d3);
  const postGeometry = new THREE.CylinderGeometry(0.07, 0.08, 1.15, 6);
  for (let i = 0; i < FENCE_POSTS; i += 1) {
    const angle = (i / FENCE_POSTS) * Math.PI * 2;
    const { x, z } = polar(angle, PARK_RADIUS);
    const post = new THREE.Mesh(postGeometry, fenceMaterial);
    post.position.set(x, 0.575, z);
    post.castShadow = true;
    group.add(post);
  }
  const railGeometry = new THREE.TorusGeometry(PARK_RADIUS, 0.045, 5, 72);
  for (const height of [0.52, 0.92]) {
    const rail = new THREE.Mesh(railGeometry, fenceMaterial);
    rail.rotation.x = Math.PI / 2;
    rail.position.y = height;
    rail.castShadow = true;
    group.add(rail);
  }

  return {
    group,
    radius: PARK_RADIUS,
    colliders,
    dispose: () => disposePark({ group })
  };
}

export function disposePark(park) {
  park.group.traverse((object) => {
    if (object.isMesh) {
      object.geometry.dispose();
      if (Array.isArray(object.material)) {
        for (const material of object.material) {
          material.dispose();
        }
      } else {
        object.material.dispose();
      }
    }
  });
}
