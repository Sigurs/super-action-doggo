import * as THREE from 'three';

// One full day/night loop takes this many real seconds; t runs [0, 1) with
// t=0 at dawn, 0.25 noon, 0.5 dusk and 0.75 midnight. All keyframe values are
// interpolated every frame onto the lights/sky/fog the playing state owns.
export const DAY_LENGTH_SECONDS = 240;
export const DAY_START_TIME = 0.12; // mid-morning

const SUN_DISTANCE = 34;

const KEYFRAMES = [
  {
    t: 0.0, azimuth: -1.3, elevation: 0.15,
    sunColor: 0xff9e6a, sunIntensity: 1.05,
    hemiSky: 0xd9b8a6, hemiGround: 0x6f7a5f, hemiIntensity: 0.5,
    skyColor: 0xe8a97e, fogColor: 0xdfb18c
  },
  {
    t: 0.055, azimuth: -1.05, elevation: 0.42,
    sunColor: 0xffd9a8, sunIntensity: 2.1,
    hemiSky: 0xcfe4f2, hemiGround: 0x86a877, hemiIntensity: 0.95,
    skyColor: 0xbfe0f2, fogColor: 0xc6e2ef
  },
  {
    t: 0.25, azimuth: 0.0, elevation: 1.05,
    sunColor: 0xffffff, sunIntensity: 2.4,
    hemiSky: 0xcfe8ff, hemiGround: 0x8fae7c, hemiIntensity: 1.15,
    skyColor: 0xa6dcf5, fogColor: 0xa6dcf5
  },
  {
    t: 0.42, azimuth: 1.0, elevation: 0.5,
    sunColor: 0xffe0b0, sunIntensity: 2.0,
    hemiSky: 0xc4dcf0, hemiGround: 0x8fae7c, hemiIntensity: 1.0,
    skyColor: 0xb5d8ea, fogColor: 0xbcd8e8
  },
  {
    t: 0.5, azimuth: 1.3, elevation: 0.16,
    sunColor: 0xff8a55, sunIntensity: 1.0,
    hemiSky: 0xe8a070, hemiGround: 0x74695a, hemiIntensity: 0.55,
    skyColor: 0xf29a5e, fogColor: 0xe8a878
  },
  {
    t: 0.56, azimuth: 0.6, elevation: 0.35,
    sunColor: 0x9fb6de, sunIntensity: 0.5,
    hemiSky: 0x43536e, hemiGround: 0x2f3a35, hemiIntensity: 0.45,
    skyColor: 0x2c3a55, fogColor: 0x2d3a52
  },
  {
    t: 0.64, azimuth: 0.2, elevation: 0.85,
    sunColor: 0xb8ccef, sunIntensity: 0.5,
    hemiSky: 0x33415e, hemiGround: 0x26322b, hemiIntensity: 0.4,
    skyColor: 0x1b2539, fogColor: 0x1d2738
  },
  {
    t: 0.78, azimuth: -0.3, elevation: 0.6,
    sunColor: 0xaebfe6, sunIntensity: 0.42,
    hemiSky: 0x2e3c58, hemiGround: 0x24302a, hemiIntensity: 0.37,
    skyColor: 0x182234, fogColor: 0x1a2434
  },
  {
    t: 0.88, azimuth: -0.9, elevation: 0.25,
    sunColor: 0x8fa4cc, sunIntensity: 0.36,
    hemiSky: 0x39415c, hemiGround: 0x28322c, hemiIntensity: 0.36,
    skyColor: 0x1e2942, fogColor: 0x202b44
  },
  {
    t: 0.94, azimuth: -1.25, elevation: 0.12,
    sunColor: 0xd98a70, sunIntensity: 0.6,
    hemiSky: 0x6b5a70, hemiGround: 0x3c4438, hemiIntensity: 0.42,
    skyColor: 0x4a4466, fogColor: 0x4c4460
  }
];

// Pre-resolve keyframe colors once so the per-frame update allocates nothing.
for (const keyframe of KEYFRAMES) {
  keyframe.sunColor = new THREE.Color(keyframe.sunColor);
  keyframe.hemiSky = new THREE.Color(keyframe.hemiSky);
  keyframe.hemiGround = new THREE.Color(keyframe.hemiGround);
  keyframe.skyColor = new THREE.Color(keyframe.skyColor);
  keyframe.fogColor = new THREE.Color(keyframe.fogColor);
}

const lerp = (a, b, t) => a + (b - a) * t;

export function createDayNight({ sun, hemisphere, scene }) {
  const state = {
    t: DAY_START_TIME,

    reset() {
      this.t = DAY_START_TIME;
      this.apply();
    },

    setTime(t) {
      this.t = ((t % 1) + 1) % 1;
      this.apply();
    },

    update(dt) {
      this.t = (this.t + dt / DAY_LENGTH_SECONDS) % 1;
      this.apply();
    },

    apply() {
      const count = KEYFRAMES.length;
      let index = count - 1;
      for (let i = 0; i < count; i += 1) {
        if (this.t >= KEYFRAMES[i].t) {
          index = i;
        } else {
          break;
        }
      }
      const from = KEYFRAMES[index];
      const to = KEYFRAMES[(index + 1) % count];
      const toT = index + 1 < count ? to.t : to.t + 1;
      const span = toT - from.t;
      const f = span > 0 ? Math.min(1, Math.max(0, (this.t - from.t) / span)) : 0;

      const azimuth = lerp(from.azimuth, to.azimuth, f);
      const elevation = lerp(from.elevation, to.elevation, f);
      sun.position.set(
        Math.sin(azimuth) * Math.cos(elevation) * SUN_DISTANCE,
        Math.sin(elevation) * SUN_DISTANCE,
        Math.cos(azimuth) * Math.cos(elevation) * SUN_DISTANCE
      );
      sun.intensity = lerp(from.sunIntensity, to.sunIntensity, f);
      sun.color.lerpColors(from.sunColor, to.sunColor, f);

      hemisphere.intensity = lerp(from.hemiIntensity, to.hemiIntensity, f);
      hemisphere.color.lerpColors(from.hemiSky, to.hemiSky, f);
      hemisphere.groundColor.lerpColors(from.hemiGround, to.hemiGround, f);

      scene.background.lerpColors(from.skyColor, to.skyColor, f);
      scene.fog.color.lerpColors(from.fogColor, to.fogColor, f);
    }
  };

  return state;
}
