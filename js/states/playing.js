import * as THREE from 'three';
import { createDog, disposeDog } from '../dog-builder.js';
import { createPark } from '../park-builder.js';
import { CameraRig } from '../camera-rig.js';
import { DogController } from '../dog-controller.js';
import { DogAnimator } from '../anim.js';

const SKY_COLOR = 0xa6dcf5;
const FOG_NEAR = 32;
const FOG_FAR = 70;
const ENABLE_SHADOWS = true;
const BARK_TEXT = 'Woof!';
const BARK_VISIBLE_SECONDS = 0.55;

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

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(SKY_COLOR);
    this.scene.fog = new THREE.Fog(SKY_COLOR, FOG_NEAR, FOG_FAR);

    this.camera = new THREE.PerspectiveCamera(55, 1, 0.1, 120);
    this.rig = new CameraRig(this.camera);

    this.scene.add(new THREE.HemisphereLight(0xfff8ec, 0x8fae7c, 1.15));
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
    this.scene.add(sun);

    this.park = createPark();
    this.scene.add(this.park.group);

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
      if (event.button === 0 && document.pointerLockElement !== this.canvas) {
        this.dragging = true;
        this.lastPointerX = event.clientX;
        this.lastPointerY = event.clientY;
      }
    };
    this.onMouseUp = () => {
      this.dragging = false;
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

    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();

    this.nameElement.textContent = options.preset.name;
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

  update(dt) {
    this.elapsed += dt;
    this.controller.update(dt, this.rig.yaw);
    if (this.controller.consumeBark()) {
      this.animator.triggerBark();
      this.showBarkBubble();
    }
    this.animator.update(dt, this.controller);
    this.rig.update(dt, this.dog.position);
    if (this.elapsed < this.barkVisibleUntil) {
      this.positionBarkBubble();
    }
  }

  render(renderer) {
    renderer.render(this.scene, this.camera);
  }

  resize(width, height) {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }
}
