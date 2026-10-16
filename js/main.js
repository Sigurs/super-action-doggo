import * as THREE from 'three';
import { Game } from './game.js';

const canvas = document.getElementById('game-canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const game = new Game();
game.start();
window.game = game;

window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  game.resize(window.innerWidth, window.innerHeight);
});

let previousTime = performance.now();

function frame(now) {
  const dt = Math.min((now - previousTime) / 1000, 0.1);
  previousTime = now;
  game.update(dt);
  game.render(renderer);
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
