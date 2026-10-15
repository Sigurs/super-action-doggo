import * as THREE from 'three';
import { createDog, disposeDog } from '../dog-builder.js';
import { updateIdle } from '../anim.js';

export class PlayingState {
  constructor(game) {
    this.game = game;
    this.elapsed = 0;
    this.dog = null;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xa6dcf5);

    this.camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(80, 80),
      new THREE.MeshStandardMaterial({ color: 0x83c86e, flatShading: true, roughness: 1 })
    );
    ground.rotation.x = -Math.PI / 2;
    this.scene.add(ground);

    this.scene.add(new THREE.HemisphereLight(0xfff8ec, 0x8fae7c, 1.15));
    const sun = new THREE.DirectionalLight(0xffffff, 2.0);
    sun.position.set(4, 7, 5);
    this.scene.add(sun);
  }

  enter(options = {}) {
    this.elapsed = 0;
    if (this.dog) {
      this.scene.remove(this.dog);
      disposeDog(this.dog);
    }
    this.dog = createDog(options.preset);
    this.scene.add(this.dog);
    this.camera.position.set(0, 1.9, 4.4);
    this.camera.lookAt(0, 0.8, 0);

    this.nameElement = document.getElementById('hud-dog-name');
    this.nameElement.textContent = options.preset.name;
    this.backButton = document.getElementById('back-to-start');
    this.onBack = () => this.game.changeState('start');
    this.backButton.addEventListener('click', this.onBack);
  }

  exit() {
    this.backButton.removeEventListener('click', this.onBack);
  }

  update(dt) {
    this.elapsed += dt;
    updateIdle(this.dog, this.elapsed);
  }

  render(renderer) {
    renderer.render(this.scene, this.camera);
  }

  resize(width, height) {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }
}
