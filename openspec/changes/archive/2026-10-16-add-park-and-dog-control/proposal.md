# Proposal

## Why

Milestone 1 shipped a playable shell: static site, start screen with dog selection, and a placeholder playing scene. The game still has no park to explore and no dog to control. This change delivers Milestone 2 of the Epic (change `build-dog-park-game`, design D11 task group 2) — the low-poly park world and third-person dog control — so Super Action Doggo becomes an actual game.

## What Changes

- Replace the placeholder playing scene with a low-poly park world: ground with grass and path areas, trees, and park props, all procedural Three.js primitives with flat shading and no external assets (Epic design D3). Daytime lighting only — the day/night cycle arrives with Milestone 4.
- Add a bounded play area (a circular park with a visible boundary) with movement clamping and simple prop collision push-out; bespoke gravity, no physics engine (Epic design D6).
- Add a third-person camera rig that follows the dog from behind and above, with mouse orbit via the Pointer Lock API and a drag-to-orbit fallback when lock is unavailable (Epic design D5).
- Add player dog control: camera-relative WASD/arrow walking, Shift to run with a visibly faster gait, Space to jump with landing lock-out, a sit action held until the dog is moved, and a bark action with a clearly visible animation plus an on-screen cue (no audio in Phase 1).
- Extend the shared procedural animation helpers from Milestone 1 into per-state poses (idle, walk, run, jump, sit, bark) via code-driven transforms — no skeletal rigs (Epic design D4).
- Update `dog-selection`: starting the game now begins in the park under player control instead of the placeholder scene.
- Update the README's controls section with the movement and action keys.

## Capabilities

### New Capabilities

- `park-scene`: the low-poly 3D park world — grass, paths, trees, park props and the bounded play area that keeps the dog inside the park. The day/night lighting cycle is deliberately out of scope here and arrives with the living-park milestone.
- `dog-control`: keyboard and mouse control of the player dog — third-person follow camera with mouse orbit, camera-relative movement, running, jumping, sitting and barking with a visible cue.

### Modified Capabilities

- `dog-selection`: the "game starts with the chosen dog" requirement drops its Milestone 1 placeholder language — gameplay now begins in the park with the chosen dog under player control.

## Impact

- `js/states/playing.js` is replaced wholesale by the park playing scene; new modules under `js/` build the park, drive the camera rig and control the dog; `js/anim.js` grows per-state procedural poses; `index.html`/`css/style.css` gain the on-screen bark cue and a pointer-lock hint; `README.md` documents the new controls.
- No new runtime dependencies: still only `three` from the pinned CDN import map; Pointer Lock is a browser API. No build step, no physics engine, no `three/addons`.

## Assumptions and open questions

- The park boundary is a circle (the Epic's open question "circle vs rectangle" is left to this milestone): a radial park reads naturally as a dog park, clamping is a simple radial check, and a low fence ring makes the boundary visible.
- Action keys follow genre convention: `Shift` run, `Space` jump, `C` sit, `B` bark; movement is WASD or arrow keys. The Epic left exact bindings to this milestone.
- The park-scene day/night requirement and its two scenarios from the Epic's spec are not part of this change; the living-park milestone (Milestone 4) adds them to `park-scene` as a spec modification. Until then the park is lit by fixed pleasant daytime lighting.
- The Epic's bark scenario ends with "any nearby park visitors react"; visitors arrive in Milestone 4, so this change's dog-control bark scenario covers only the dog's bark animation and on-screen cue. Milestone 4 extends it when `park-visitors` lands.
- The park prop list (Epic leaves it to this milestone): trees, benches, bushes, rocks and a fire hydrant, plus a fence ring marking the boundary. Tunable during implementation.
- Pointer Lock engages on a click into the canvas and `Esc` releases it; while unlocked, a hint is shown and dragging with the left mouse button orbits the camera as the fallback.
- Desktop browsers with keyboard and mouse only; UI copy in English; no audio, no saving (per the Epic's plan).
