import { StartState } from './states/start.js';
import { PlayingState } from './states/playing.js';

const OVERLAY_IDS = {
  start: 'start-screen',
  playing: 'playing-hud'
};

export class Game {
  constructor() {
    this.states = {
      start: new StartState(this),
      playing: new PlayingState(this)
    };
    this.current = null;
    this.currentName = null;
  }

  start() {
    this.changeState('start');
  }

  changeState(name, options = {}) {
    if (this.current) {
      this.current.exit();
    }
    for (const id of Object.values(OVERLAY_IDS)) {
      document.getElementById(id).classList.add('hidden');
    }
    const overlay = document.getElementById(OVERLAY_IDS[name]);
    if (overlay) {
      overlay.classList.remove('hidden');
    }
    this.currentName = name;
    this.current = this.states[name];
    this.current.enter(options);
  }

  update(dt) {
    if (this.current) {
      this.current.update(dt);
    }
  }

  render(renderer) {
    if (this.current) {
      this.current.render(renderer);
    }
  }

  resize(width, height) {
    if (this.current && this.current.resize) {
      this.current.resize(width, height);
    }
  }
}
