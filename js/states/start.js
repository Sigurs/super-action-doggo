import * as THREE from 'three';
import { createDog, DOG_PRESETS } from '../dog-builder.js';
import { updateIdle } from '../anim.js';

const TURNTABLE_OFFSET_X = 1.35;
const STAGE_HEIGHT = 0.35;
const TURNTABLE_SPEED = 0.55;

export class StartState {
  constructor(game) {
    this.game = game;
    this.selectedIndex = 0;
    this.elapsed = 0;
    this.turntables = [];
    this.dogs = [];
    this.boundHandlers = [];
    this.cards = [];
    this.buildScene();
  }

  buildScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xb9e5f6);

    this.camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    this.camera.position.set(0, 2.1, 7.3);
    this.camera.lookAt(0, 0.85, 0);

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(60, 60),
      new THREE.MeshStandardMaterial({ color: 0xa6d590, flatShading: true, roughness: 1 })
    );
    ground.rotation.x = -Math.PI / 2;
    this.scene.add(ground);

    const stage = new THREE.Mesh(
      new THREE.CylinderGeometry(2.7, 2.9, STAGE_HEIGHT, 24),
      new THREE.MeshStandardMaterial({ color: 0xead9b2, flatShading: true, roughness: 0.9 })
    );
    stage.position.y = STAGE_HEIGHT / 2;
    this.scene.add(stage);

    this.scene.add(new THREE.HemisphereLight(0xfff8ec, 0x9db98a, 1.15));
    const sun = new THREE.DirectionalLight(0xffffff, 2.0);
    sun.position.set(4, 7, 5);
    this.scene.add(sun);

    DOG_PRESETS.forEach((preset, index) => {
      const turntable = new THREE.Group();
      turntable.position.set(
        index === 0 ? -TURNTABLE_OFFSET_X : TURNTABLE_OFFSET_X,
        STAGE_HEIGHT,
        0
      );
      const dog = createDog(preset);
      this.dogs.push(dog);
      turntable.add(dog);
      this.turntables.push(turntable);
      this.scene.add(turntable);
    });

    this.ring = new THREE.Mesh(
      new THREE.RingGeometry(0.95, 1.2, 40),
      new THREE.MeshBasicMaterial({
        color: 0xffd25e,
        transparent: true,
        opacity: 0.85,
        side: THREE.DoubleSide,
        depthWrite: false
      })
    );
    this.ring.rotation.x = -Math.PI / 2;
    this.ring.position.y = STAGE_HEIGHT + 0.02;
    this.ring.renderOrder = 1;
    this.scene.add(this.ring);
  }

  enter() {
    this.elapsed = 0;
    this.cards = [...document.querySelectorAll('.dog-card')];
    this.cards.forEach((card) => {
      const index = Number(card.dataset.dogIndex);
      const nameElement = card.querySelector('.dog-name');
      const taglineElement = card.querySelector('.dog-tagline');
      if (nameElement) nameElement.textContent = DOG_PRESETS[index].name;
      if (taglineElement) taglineElement.textContent = DOG_PRESETS[index].tagline;
      const onClick = () => this.select(index);
      card.addEventListener('click', onClick);
      this.boundHandlers.push([card, onClick]);
    });

    this.startButton = document.getElementById('start-button');
    this.onStart = () => this.game.changeState('playing', { preset: DOG_PRESETS[this.selectedIndex] });
    this.startButton.addEventListener('click', this.onStart);

    this.applySelection();
  }

  exit() {
    for (const [element, handler] of this.boundHandlers) {
      element.removeEventListener('click', handler);
    }
    this.boundHandlers = [];
    this.startButton.removeEventListener('click', this.onStart);
  }

  select(index) {
    if (index === this.selectedIndex) {
      this.applySelection();
      return;
    }
    this.selectedIndex = index;
    this.applySelection();
  }

  applySelection() {
    const turntable = this.turntables[this.selectedIndex];
    this.ring.position.x = turntable.position.x;
    this.ring.position.z = turntable.position.z;
    this.cards.forEach((card, cardIndex) => {
      const selected = cardIndex === this.selectedIndex;
      card.classList.toggle('selected', selected);
      card.setAttribute('aria-pressed', String(selected));
    });
    if (this.startButton) {
      this.startButton.textContent = `Start as ${DOG_PRESETS[this.selectedIndex].name}`;
    }
  }

  update(dt) {
    this.elapsed += dt;
    this.turntables.forEach((turntable, index) => {
      turntable.rotation.y += dt * (index === 0 ? TURNTABLE_SPEED : -TURNTABLE_SPEED);
      updateIdle(this.dogs[index], this.elapsed + index * 1.7);
    });
    this.ring.material.opacity = 0.7 + Math.sin(this.elapsed * 3) * 0.2;
  }

  render(renderer) {
    renderer.render(this.scene, this.camera);
  }

  resize(width, height) {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }
}
