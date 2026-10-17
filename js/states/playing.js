import * as THREE from 'three';
import { createDog, disposeDog } from '../dog-builder.js';
import { createPark } from '../park-builder.js';
import { CameraRig } from '../camera-rig.js';
import { DogController } from '../dog-controller.js';
import { DogAnimator } from '../anim.js';
import { createNeeds, TUNING as NEEDS_TUNING } from '../needs.js';
import { createBall } from '../ball.js';
import { createNpcDogs } from '../npc-dogs.js';
import { createVisitors } from '../visitors.js';
import { createDayNight } from '../day-night.js';

const SKY_COLOR = 0xa6dcf5;
const FOG_NEAR = 32;
const FOG_FAR = 70;
const ENABLE_SHADOWS = true;
const BARK_TEXT = 'Woof!';
const BARK_VISIBLE_SECONDS = 0.55;
const GREET_PROMPT_RANGE = 2.2;
const GREET_PROMPT_HIDE_RANGE = 2.6;
const GREET_TRIGGER_RANGE = 2.5;
const GREET_CANCEL_RANGE = 3.4;
const GREET_CANCEL_SPEED = 0.65;
const GREET_PLAYER_SECONDS = 1.9;
const GREET_TURN_RATE = 8;
const FPS_WINDOW_SECONDS = 0.5;
const FPS_PLACEHOLDER = '-- FPS';
const THROW_CHARGE_SECONDS = 1.2;
const THROW_MIN_HOLD = 0.2; // holds shorter than this never throw
const THROW_MIN_SPEED = 6;
const THROW_MAX_SPEED = 16;
const THROW_STATIONARY_PX = 8; // unlocked drag beyond this cancels charging
const THROW_LAUNCH_LIFT = 0.25; // above the head anchor

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

export class PlayingState {
  constructor(game) {
    this.game = game;
    this.elapsed = 0;
    this.dog = null;
    this.controller = null;
    this.animator = null;
    this.barkVisibleUntil = 0;
    this.dragging = false;
    this.lastPointerX = 0;
    this.lastPointerY = 0;
    this.promptDog = null;
    this.greetNpc = null;
    this.greetTimer = 0;
    this.lastMoodPercent = -1;
    this.lastEnergyPercent = -1;
    this.fpsFrames = 0;
    this.fpsWindowStart = 0;
    this.charging = false;
    this.chargeElapsed = 0;
    this.chargeAnchorX = 0;
    this.chargeAnchorY = 0;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(SKY_COLOR);
    this.scene.fog = new THREE.Fog(SKY_COLOR, FOG_NEAR, FOG_FAR);

    this.camera = new THREE.PerspectiveCamera(55, 1, 0.1, 120);
    this.rig = new CameraRig(this.camera);

    this.hemisphere = new THREE.HemisphereLight(0xfff8ec, 0x8fae7c, 1.15);
    this.scene.add(this.hemisphere);
    const sun = new THREE.DirectionalLight(0xffffff, 2.0);
    sun.position.set(18, 26, 12);
    if (ENABLE_SHADOWS) {
      sun.castShadow = true;
      sun.shadow.mapSize.set(2048, 2048);
      sun.shadow.camera.left = -38;
      sun.shadow.camera.right = 38;
      sun.shadow.camera.top = 38;
      sun.shadow.camera.bottom = -38;
      sun.shadow.camera.near = 1;
      sun.shadow.camera.far = 90;
      sun.shadow.bias = -0.0005;
    }
    this.sun = sun;
    this.scene.add(sun);

    this.park = createPark();
    this.scene.add(this.park.group);

    this.npcDogs = createNpcDogs(this.park);
    this.scene.add(this.npcDogs.group);

    this.ball = createBall(this.scene, this.park);

    this.needs = createNeeds();
    this.visitors = createVisitors(this.park, {
      onMoodGain: (amount) => this.needs.mood.gain(amount)
    });
    this.scene.add(this.visitors.group);

    this.dayNight = createDayNight({
      sun: this.sun,
      hemisphere: this.hemisphere,
      scene: this.scene
    });

    this.headPosition = new THREE.Vector3();

    this.bindElements();
    this.bindPointerHandlers();
  }

  bindElements() {
    this.nameElement = document.getElementById('hud-dog-name');
    this.backButton = document.getElementById('back-to-start');
    this.canvas = document.getElementById('game-canvas');
    this.lockHint = document.getElementById('lock-hint');
    this.barkBubble = document.getElementById('bark-bubble');
    this.greetPrompt = document.getElementById('greet-prompt');
    this.moodFill = document.getElementById('mood-fill');
    this.energyFill = document.getElementById('energy-fill');
    this.chargeBar = document.getElementById('charge-bar');
    this.chargeFill = document.getElementById('charge-fill');
    this.fpsCounter = document.getElementById('fps-counter');
    this.onBack = () => this.game.changeState('start');
  }

  bindPointerHandlers() {
    this.onCanvasClick = () => {
      if (document.pointerLockElement !== this.canvas) {
        try {
          const request = this.canvas.requestPointerLock();
          if (request && typeof request.catch === 'function') {
            request.catch(() => {});
          }
        } catch (error) {
          // Pointer lock unavailable; the drag fallback stays active.
        }
      }
    };
    this.onMouseDown = (event) => {
      if (event.button !== 0) {
        return;
      }
      if (document.pointerLockElement === this.canvas) {
        // Locked: any left-button hold charges a throw.
        this.startCharge();
      } else {
        this.dragging = true;
        this.lastPointerX = event.clientX;
        this.lastPointerY = event.clientY;
        // Unlocked: a stationary hold charges; a drag cancels it below.
        this.chargeAnchorX = event.clientX;
        this.chargeAnchorY = event.clientY;
        this.startCharge();
      }
    };
    this.onMouseUp = (event) => {
      const wasCharging = this.charging;
      const held = this.chargeElapsed;
      this.cancelCharge();
      if (event.button === 0) {
        this.dragging = false;
      }
      if (wasCharging && held >= THROW_MIN_HOLD) {
        this.throwBall(this.chargeStrength(held));
      }
    };
    this.onMouseMove = (event) => {
      if (document.pointerLockElement === this.canvas) {
        this.rig.orbit(event.movementX || 0, event.movementY || 0);
      } else if (this.dragging) {
        this.rig.orbit(
          event.clientX - this.lastPointerX,
          event.clientY - this.lastPointerY
        );
        this.lastPointerX = event.clientX;
        this.lastPointerY = event.clientY;
        if (this.charging) {
          const dx = event.clientX - this.chargeAnchorX;
          const dy = event.clientY - this.chargeAnchorY;
          if (Math.hypot(dx, dy) > THROW_STATIONARY_PX) {
            this.cancelCharge();
          }
        }
      }
    };
    this.onPointerLockChange = () => this.updateLockHint();
    this.onPointerLockError = () => this.updateLockHint();
  }

  updateLockHint() {
    const locked = document.pointerLockElement === this.canvas;
    this.lockHint.classList.toggle('hidden', locked);
  }

  enter(options = {}) {
    this.elapsed = 0;
    if (this.dog) {
      this.scene.remove(this.dog);
      disposeDog(this.dog);
    }
    this.dog = createDog(options.preset);
    this.dog.traverse((object) => {
      if (object.isMesh) {
        object.castShadow = true;
      }
    });
    this.scene.add(this.dog);

    this.controller = new DogController(this.dog, this.park);
    this.controller.attach();
    this.animator = new DogAnimator(this.dog);
    this.rig.reset(0, 0);

    this.needs = createNeeds();
    this.lastMoodPercent = -1;
    this.lastEnergyPercent = -1;
    this.npcDogs.reset();
    this.visitors.reset();
    this.dayNight.reset();
    this.promptDog = null;
    this.greetNpc = null;
    this.greetTimer = 0;

    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();

    this.nameElement.textContent = options.preset.name;
    this.fpsFrames = 0;
    this.fpsWindowStart = performance.now();
    this.fpsCounter.textContent = FPS_PLACEHOLDER;
    this.backButton.addEventListener('click', this.onBack);
    this.canvas.addEventListener('click', this.onCanvasClick);
    this.canvas.addEventListener('mousedown', this.onMouseDown);
    window.addEventListener('mouseup', this.onMouseUp);
    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('pointerlockchange', this.onPointerLockChange);
    document.addEventListener('pointerlockerror', this.onPointerLockError);
    this.updateLockHint();
  }

  exit() {
    this.controller.detach();
    this.backButton.removeEventListener('click', this.onBack);
    this.canvas.removeEventListener('click', this.onCanvasClick);
    this.canvas.removeEventListener('mousedown', this.onMouseDown);
    window.removeEventListener('mouseup', this.onMouseUp);
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('pointerlockchange', this.onPointerLockChange);
    document.removeEventListener('pointerlockerror', this.onPointerLockError);
    this.dragging = false;
    if (document.pointerLockElement === this.canvas) {
      document.exitPointerLock();
    }
    this.lockHint.classList.add('hidden');
    this.barkBubble.classList.remove('pop');
    this.setPrompt(null);
    this.greetNpc = null;
    this.greetTimer = 0;
  }

  showBarkBubble() {
    this.barkVisibleUntil = this.elapsed + BARK_VISIBLE_SECONDS;
    this.barkBubble.textContent = BARK_TEXT;
    this.barkBubble.classList.remove('pop');
    void this.barkBubble.offsetWidth;
    this.barkBubble.classList.add('pop');
    this.positionBarkBubble();
  }

  positionBarkBubble() {
    this.dog.userData.parts.head.getWorldPosition(this.headPosition);
    this.headPosition.project(this.camera);
    const x = (this.headPosition.x * 0.5 + 0.5) * window.innerWidth;
    const y = (-this.headPosition.y * 0.5 + 0.5) * window.innerHeight;
    this.barkBubble.style.left = `${x}px`;
    this.barkBubble.style.top = `${y}px`;
  }

  setPrompt(npc) {
    if (npc === this.promptDog) {
      return;
    }
    this.promptDog = npc;
    if (npc) {
      this.greetPrompt.textContent = `Press E to greet ${npc.preset.name}`;
      this.greetPrompt.classList.remove('hidden');
    } else {
      this.greetPrompt.classList.add('hidden');
    }
  }

  updateGreet(dt) {
    const controller = this.controller;

    if (this.greetNpc) {
      const dx = this.greetNpc.x - controller.x;
      const dz = this.greetNpc.z - controller.z;
      const distance = Math.hypot(dx, dz);
      this.greetTimer -= dt;
      if (controller.speed > GREET_CANCEL_SPEED || distance > GREET_CANCEL_RANGE) {
        this.npcDogs.cancelGreet(this.greetNpc);
        this.greetNpc = null;
      } else if (this.greetTimer <= 0 || this.greetNpc.state !== 'greet') {
        this.greetNpc = null;
      } else {
        controller.yaw = easeAngle(controller.yaw, Math.atan2(dx, dz), GREET_TURN_RATE, dt);
        this.dog.rotation.y = controller.yaw;
      }
    }

    if (this.greetNpc) {
      this.setPrompt(null);
    } else if (this.promptDog) {
      const dx = this.promptDog.x - controller.x;
      const dz = this.promptDog.z - controller.z;
      const beyondHide = dx * dx + dz * dz > GREET_PROMPT_HIDE_RANGE * GREET_PROMPT_HIDE_RANGE;
      if (beyondHide || this.promptDog.state === 'greet') {
        this.setPrompt(null);
      }
    } else {
      const npc = this.npcDogs.nearest(controller, GREET_PROMPT_RANGE);
      if (npc) {
        this.setPrompt(npc);
      }
    }

    if (this.controller.consumeGreet() && !this.greetNpc) {
      const npc = this.npcDogs.nearest(controller, GREET_TRIGGER_RANGE);
      if (npc) {
        const counts = this.npcDogs.tryGreet(npc);
        if (counts) {
          this.needs.mood.gain(NEEDS_TUNING.moodGainGreet, 'greet');
        }
        this.greetNpc = npc;
        this.greetTimer = GREET_PLAYER_SECONDS;
        this.setPrompt(null);
      }
    }
  }

  updateFpsCounter() {
    this.fpsFrames += 1;
    const now = performance.now();
    const elapsed = (now - this.fpsWindowStart) / 1000;
    if (elapsed >= FPS_WINDOW_SECONDS) {
      this.fpsCounter.textContent = `${Math.round(this.fpsFrames / elapsed)} FPS`;
      this.fpsFrames = 0;
      this.fpsWindowStart = now;
    }
  }

  activityFor(jumped) {
    if (jumped) {
      return 'jump';
    }
    const locomotion = this.controller.locomotion;
    if (locomotion === 'jump') {
      // Airborne frames after the launch: the jump chunk already paid for it.
      return 'air';
    }
    return locomotion;
  }

  updateMeters() {
    const moodPercent = Math.round(this.needs.mood.value);
    if (moodPercent !== this.lastMoodPercent) {
      this.moodFill.style.width = `${moodPercent}%`;
      this.lastMoodPercent = moodPercent;
    }
    const energyPercent = Math.round(this.needs.energy.value);
    if (energyPercent !== this.lastEnergyPercent) {
      this.energyFill.style.width = `${energyPercent}%`;
      this.lastEnergyPercent = energyPercent;
    }
  }

  update(dt) {
    this.elapsed += dt;
    const wasGrounded = this.controller.grounded;
    this.controller.update(dt, this.rig.yaw, this.needs.canRunJump());
    const jumped = wasGrounded && !this.controller.grounded;
    this.needs.update(dt, this.activityFor(jumped));
    if (this.controller.consumeBark()) {
      this.animator.triggerBark();
      this.showBarkBubble();
      this.visitors.onBark(this.controller.x, this.controller.z);
    }
    this.npcDogs.update(dt, this.controller);
    this.visitors.update(dt, this.controller);
    this.updateGreet(dt);
    this.dayNight.update(dt);
    this.controller.greeting = this.greetNpc !== null;
    this.animator.update(dt, this.controller);
    this.rig.update(dt, this.dog.position);
    if (this.elapsed < this.barkVisibleUntil) {
      this.positionBarkBubble();
    }
    this.updateMeters();
    this.updateFpsCounter();
  }

  render(renderer) {
    renderer.render(this.scene, this.camera);
  }

  resize(width, height) {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }
}
