# Design

## Context

Milestone 1 delivered the skeleton this card builds on: one renderer and `requestAnimationFrame` loop (`js/main.js`), a `START`/`PLAYING` state machine (`js/game.js`), the parameterized dog builder with two presets (`js/dog-builder.js`), a tiny idle-animation helper (`js/anim.js`), and a placeholder playing scene (`js/states/playing.js`). The Epic's approved plan (`.siggydev/parents/sad-1/`, change `build-dog-park-game`) fixes the approach: procedural primitives only (D3), procedural animation with no rigs (D4), pointer-lock orbit camera (D5), bespoke movement/gravity/boundary with no physics engine (D6). This design applies those and decides what the Epic left open to this milestone: the boundary shape, the prop list, the exact key bindings, and the module layout.

## Goals / Non-Goals

**Goals:**

- A park playing scene that replaces Milestone 1's placeholder wholesale and that later milestones (fetch, needs, NPC dogs, visitors, day/night) extend without refactors.
- Genre-standard third-person feel: camera-relative movement, smooth turning, clearly readable gait and pose changes.
- Keep the codebase dependency-free and allocation-free per frame: static park built once, shared geometries/materials, plain math for movement and collision.

**Non-Goals:**

- No fetch/ball, needs meters, NPC dogs, visitors or day/night cycle — later milestones own those.
- No physics engine, no collision meshes, no terrain height (flat ground at `y = 0`).
- No mobile/touch, gamepad, key remapping UI, or audio.

## Decisions

### Park layout: a circular park (Epic open question decided)
A circle of radius ~30 m: grass ground disc, a ring path plus two crossing straight paths (flat meshes a few centimeters above the grass to avoid z-fighting), trees (2–3 procedural variants) inside and around the ring, benches along the paths, bushes, rocks, one fire hydrant, and a low fence ring that makes the boundary visible. Clamping is a radial check on the ground plane, which is why the circle wins over a rectangle: it reads as a fenced dog park and the math is a single length check.

*Alternative:* rectangle — rejected: no simpler to build, less park-like, and the fence would need corners.

### Module structure
- `js/park-builder.js` — `createPark()` returns the park group plus the collision model: the play-area radius and a list of prop colliders (`{x, z, radius}` for trees, benches, hydrant, big rocks; bushes are walk-through). Also a dispose helper, following the dog builder's pattern. No behavior, just geometry and data; NPC/visitor milestones add agents beside it.
- `js/camera-rig.js` — the third-person rig: yaw/pitch/dist orbit around a pivot that tracks the dog, smoothing on the pivot, pitch clamps so the camera never goes under the ground.
- `js/dog-controller.js` — pure state: reads the input map, integrates the dog's motion (camera-relative velocity, bespoke gravity, jump lock-out, sit state, bark trigger), clamps to the boundary, pushes out of prop colliders, and exposes the locomotion state and speed for animation. No Three.js objects of its own beyond the dog group it moves.
- `js/states/playing.js` — rewritten: owns the scene, lights, park, dog, camera rig and controller; wires input listeners on `enter`, removes them on `exit`; per-frame order is input → controller → animation → camera rig → render.

*Alternative:* one big `playing.js` — rejected: park, camera and control are each reusable by later milestones (NPCs need colliders, visitors need the camera frame), so three small modules pay off immediately.

### Input mapping (Epic open question decided)
`event.code`-based (layout-independent): `KeyW/ArrowUp`, `KeyA/ArrowLeft`, `KeyS/ArrowDown`, `KeyD/ArrowRight` move; `ShiftLeft/ShiftRight` run; `Space` jump (edge-triggered, only when grounded); `KeyC` sit (held until a movement key stands the dog up); `KeyB` bark (edge-triggered). Listeners exist only while `PLAYING` is active, and game keys get `preventDefault()` so Space/arrows never scroll the page.

### Movement, boundary and props (Epic D6 applied)
- Tunable constants in one table: walk ≈ 2.2 m/s, run ≈ 4.5 m/s, gravity ≈ −20 m/s², jump velocity ≈ 4.5 m/s (≈ 0.5 m high, snappy). Velocity eases toward the target for smooth starts/stops.
- Movement direction is the camera yaw rotated input vector; the dog's yaw turns toward movement at a fixed turn rate, so direction changes read as smooth turns.
- Jump: vertical velocity while grounded starts the leap; grounded again when `y ≤ 0`; a jump is only allowed while grounded, which is the landing lock-out.
- Boundary: after integration, if the dog's XZ distance from center exceeds `radius − dogMargin`, it is clamped to that circle.
- Props: for each collider, if the dog is within `collider.radius + dogRadius` on the XZ plane, push it out along the normal. At these speeds one pass per frame is stable; no tunnels, no physics.

### Procedural animation with pose targets (Epic D4 applied)
`js/dog-builder.js` gains animatable pivots: each leg becomes a pivot group at the hip (so `rotation.x` swings it); head, tail and torso pivots already exist. The `createDog(params)`/`disposeDog` API and presets stay unchanged, so the start screen is untouched and Milestone 4's NPC dogs reuse the same rig.

`js/anim.js` keeps `updateIdle` and adds a pose-target system: each state (idle, walk, run, jump, sit, bark) defines target angles for legs/torso/head/tail; every frame the current angles ease toward the targets, so state changes blend instead of popping. Gaits: walk = diagonal leg pairs on a sine scaled by speed; run = a gallop pattern (front pair then hind pair) at higher frequency with body bob and pitch — a visibly different silhouette, satisfying the run spec. Sit folds the hind legs and pitches the torso up; jump tucks front legs back and hind legs forward; bark snaps the head up with a small body recoil.

The on-screen bark cue is a DOM "Woof!" bubble (Epic D9): the dog's head position is projected to screen coordinates and the bubble appears there for ~0.5 s with a CSS pop animation. No audio in Phase 1.

### Camera rig and pointer lock (Epic D5 applied)
Pivot at the dog plus ~0.7 m; spherical offset with defaults dist ≈ 3.4 m, pitch ≈ 0.35 rad (clamped ≈ 0.05–1.2), yaw free. Clicking the canvas requests Pointer Lock; mouse deltas then orbit. `Esc` releases (browser behavior); while unlocked, or if lock is denied, dragging with the left mouse button orbits instead — the drag fallback the Epic's risk plan calls for. A small hint ("Click to look around") is shown in the HUD whenever the pointer is not locked. The camera does not collide with props: the park is open, the distance short, and prop-camera clipping is rare and harmless at this scale.

### Scene dressing and performance
Fixed daytime lighting: hemisphere light plus a directional sun, a solid sky color and matching fog for depth. Cheap shadows (sun `castShadow`, small shadow map, ground receives, props and dog cast) are enabled if frame rate holds — they sell the low-poly look; if they cost too much, one flag turns them off. Park props share geometries and materials, and nothing is allocated per frame (Epic performance goal).

## Risks / Trade-offs

- [Pointer Lock quirks (needs a user gesture, `Esc` exits, some setups deny it)] → engage on click into the canvas, fall back to drag-to-orbit, show the hint only while unlocked (Epic risk plan).
- [Procedural sit/jump/gallop poses can look broken] → pose targets with per-frame easing; prioritize readable silhouettes over realism; low-poly style forgives much (Epic risk plan).
- [Leg-pivot refactor breaks the start screen] → builder API and presets unchanged; start screen re-verified with the park work.
- [Shadows or prop count hurt frame rate] → static park built once, shared geometries/materials, modest prop count (~40); shadows behind a flag to dial back.
- [Key listeners leak past the playing state] → added in `enter`, removed in `exit`; key handling is inert on the start screen.
- [Camera clips into the ground or props at extreme pitch] → pitch clamps; ground is flat and the park is open, so prop clipping is accepted.

## Migration Plan

All changes are new modules plus a wholesale replacement of `js/states/playing.js` and additive edits to `js/dog-builder.js`, `js/anim.js`, `index.html`, `css/style.css` and `README.md`. Reverting the change restores the Milestone 1 placeholder scene; no data or saved state exists to migrate.

## Open Questions

None that change the specs, approach or tasks — remaining unknowns are implementation-time tuning (exact speeds, camera distances, park radius, prop positions, shadow on/off) contained in the single tuning table.
