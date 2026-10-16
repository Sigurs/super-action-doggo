const DEFAULTS = {
  distance: 3.4,
  pitch: 0.35,
  minPitch: 0.05,
  maxPitch: 1.2,
  pivotHeight: 0.7,
  smoothing: 9,
  yawSensitivity: 0.0032,
  pitchSensitivity: 0.0028
};

export class CameraRig {
  constructor(camera) {
    this.camera = camera;
    this.yaw = Math.PI;
    this.pitch = DEFAULTS.pitch;
    this.distance = DEFAULTS.distance;
    this.pivot = { x: 0, y: DEFAULTS.pivotHeight, z: 0 };
    this.target = { x: 0, y: DEFAULTS.pivotHeight, z: 0 };
    this.options = DEFAULTS;
  }

  reset(x, z, yaw = Math.PI) {
    this.pivot.x = x;
    this.pivot.y = DEFAULTS.pivotHeight;
    this.pivot.z = z;
    this.target.x = x;
    this.target.y = DEFAULTS.pivotHeight;
    this.target.z = z;
    this.yaw = yaw;
    this.pitch = DEFAULTS.pitch;
  }

  orbit(deltaX, deltaY) {
    this.yaw -= deltaX * DEFAULTS.yawSensitivity;
    this.pitch = Math.max(
      DEFAULTS.minPitch,
      Math.min(DEFAULTS.maxPitch, this.pitch + deltaY * DEFAULTS.pitchSensitivity)
    );
  }

  update(dt, dogPosition) {
    this.target.x = dogPosition.x;
    this.target.y = dogPosition.y + DEFAULTS.pivotHeight;
    this.target.z = dogPosition.z;
    const blend = 1 - Math.exp(-DEFAULTS.smoothing * dt);
    this.pivot.x += (this.target.x - this.pivot.x) * blend;
    this.pivot.y += (this.target.y - this.pivot.y) * blend;
    this.pivot.z += (this.target.z - this.pivot.z) * blend;

    const horizontal = Math.cos(this.pitch) * this.distance;
    const vertical = Math.sin(this.pitch) * this.distance;
    this.camera.position.set(
      this.pivot.x + Math.sin(this.yaw) * horizontal,
      this.pivot.y + vertical,
      this.pivot.z + Math.cos(this.yaw) * horizontal
    );
    this.camera.lookAt(this.pivot.x, this.pivot.y, this.pivot.z);
  }
}
