import * as THREE from 'three';
import { applyParkClamp } from './park-clamp.js';

// The single fetch ball (Epic design D6: bespoke physics, no engine). One
// mesh is created and reused for every throw; `throw()` resets it whatever
// its state (flying, rolling, resting or carried), which is how the one-ball
// rule is enforced. States: none -> flying -> rolling -> resting -> carried.

const TUNE = {
  radius: 0.14,
  gravity: -14,
  restitution: 0.45, // vertical bounce damping
  bounceFriction: 0.7, // horizontal damping applied on each bounce
  rollFriction: 2.1, // per-second exponential decay while rolling
  bounceStopSpeed: 1.1, // below this impact speed the ball stops bouncing
  restSpeed: 0.5, // below this rolling speed the ball settles
  color: 0xd6e34c
};

export function createBall(scene, park) {
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(TUNE.radius, 10, 8),
    new THREE.MeshStandardMaterial({ color: TUNE.color, flatShading: true, roughness: 0.8, metalness: 0 })
  );
  mesh.castShadow = true;
  mesh.visible = false;
  scene.add(mesh);

  const spinAxis = new THREE.Vector3();

  // Kill the velocity component pushing into whatever the clamp pushed us
  // out of, so the ball slides along it instead of sticking or jittering.
  const clampAndSlide = () => {
    const prevX = ball.x;
    const prevZ = ball.z;
    applyParkClamp(ball, TUNE.radius, park);
    const pushX = ball.x - prevX;
    const pushZ = ball.z - prevZ;
    const pushLength = Math.hypot(pushX, pushZ);
    if (pushLength > 1e-7) {
      const nx = pushX / pushLength;
      const nz = pushZ / pushLength;
      const into = ball.vx * nx + ball.vz * nz;
      if (into < 0) {
        ball.vx -= nx * into;
        ball.vz -= nz * into;
      }
    }
  };

  const ball = {
    mesh,
    state: 'none',
    x: 0,
    y: TUNE.radius,
    z: 0,
    vx: 0,
    vy: 0,
    vz: 0,
    // Where the current throw was released from (dog's x/z), for the return.
    throwOrigin: null,
    // True from a throw until the ball is dropped back at the origin: only
    // then can the dog pick it up, which stops drop/pickup from looping.
    fetchActive: false,

    throw(fromX, fromY, fromZ, dirX, dirY, dirZ, speed, originX, originZ) {
      scene.add(mesh); // re-parents the ball out of the dog's head if carried
      this.x = fromX;
      this.y = fromY;
      this.z = fromZ;
      const length = Math.hypot(dirX, dirY, dirZ) || 1;
      this.vx = (dirX / length) * speed;
      this.vy = (dirY / length) * speed;
      this.vz = (dirZ / length) * speed;
      this.state = 'flying';
      this.throwOrigin = { x: originX, z: originZ };
      this.fetchActive = true;
      clampAndSlide();
      mesh.visible = true;
      mesh.position.set(this.x, this.y, this.z);
    },

    carry(head, offsetY, offsetZ) {
      head.add(mesh); // re-parents out of the scene; follows the head
      mesh.position.set(0, offsetY, offsetZ);
      mesh.rotation.set(0, 0, 0);
      this.vx = 0;
      this.vy = 0;
      this.vz = 0;
      this.state = 'carried';
    },

    drop(x, z) {
      scene.add(mesh);
      this.x = x;
      this.z = z;
      this.y = TUNE.radius;
      this.vx = 0;
      this.vy = 0;
      this.vz = 0;
      clampAndSlide();
      mesh.position.set(this.x, this.y, this.z);
      this.state = 'resting';
      this.throwOrigin = null;
      this.fetchActive = false;
    },

    reset() {
      scene.add(mesh);
      mesh.visible = false;
      this.state = 'none';
      this.x = 0;
      this.y = TUNE.radius;
      this.z = 0;
      this.vx = 0;
      this.vy = 0;
      this.vz = 0;
      this.throwOrigin = null;
      this.fetchActive = false;
    },

    update(dt) {
      if (this.state === 'flying') {
        this.vy += TUNE.gravity * dt;
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.z += this.vz * dt;
        if (this.y <= TUNE.radius && this.vy < 0) {
          this.y = TUNE.radius;
          if (this.vy < -TUNE.bounceStopSpeed) {
            this.vy = -this.vy * TUNE.restitution;
            this.vx *= TUNE.bounceFriction;
            this.vz *= TUNE.bounceFriction;
          } else {
            this.vy = 0;
            this.state = 'rolling';
          }
        }
      } else if (this.state === 'rolling') {
        this.x += this.vx * dt;
        this.z += this.vz * dt;
        const decay = Math.exp(-TUNE.rollFriction * dt);
        this.vx *= decay;
        this.vz *= decay;
        if (Math.hypot(this.vx, this.vz) < TUNE.restSpeed) {
          this.vx = 0;
          this.vz = 0;
          this.state = 'resting';
        }
      } else {
        return;
      }

      clampAndSlide();
      mesh.position.set(this.x, this.y, this.z);

      const speed = Math.hypot(this.vx, this.vz);
      if (speed > 0.05) {
        spinAxis.set(this.vz / speed, 0, -this.vx / speed);
        mesh.rotateOnWorldAxis(spinAxis, (speed * dt) / TUNE.radius);
      }
    }
  };

  return ball;
}
