# Design

## Context

Milestones 1–2 delivered the game skeleton (`js/main.js` loop, `js/game.js` state machine), the parameterized dog builder with presets (`js/dog-builder.js`), the pose-target animation system (`js/anim.js`), the circular park with collider data (`js/park-builder.js`: `createPark()` returns `{ group, radius, colliders }`), the camera rig, and dog control with keyboard listeners owned by `DogController` (`js/dog-controller.js`: `event.code` map, edge-triggered `consumeBark()`, boundary clamp + prop push-out). The playing state (`js/states/playing.js`) owns the scene, fixed daytime lights (hemisphere + directional sun, shadows on), sky/fog colors, and the DOM HUD (bark bubble, pointer-lock hint).

The Epic's approved plan (`.siggydev/parents/sad-1/`, change `build-dog-park-game`) fixes the approach for this milestone: procedural box-and-limb humans (D3), procedural animation only (D4), agent behaviors as small state machines with per-agent cooldowns (D7), and time-of-day as a frame-updated scalar driving lights/sky/fog through interpolation tables (D8). This design applies those and decides what is left to this milestone: module layout, the interaction plumbing (prompt, greet key, bark events, mood seam), waypoint/anchor data, and tuning shape.

Sibling-milestone dependency: the fetch-and-needs milestone (mood/energy meters) has not landed on this branch. The Epic makes this milestone independent of it except for mood wiring, so this design defines a minimal mood seam here (see below); whichever milestone lands second wires into the other.

## Goals / Non-Goals

**Goals:**

- A park that feels lived in: NPC dogs that wander and can be greeted, visitors that stroll, sit and react, all reusing the existing dog builder, animator patterns and collider data without refactors.
- Day/night lighting that reads clearly (day → dusk → night → dawn) and never makes the game unplayable at night.
- Extend, don't restructure: new modules plug into the playing state's frame order; existing modules get additive changes only (plus one small extracted collision helper).
- Keep the per-frame cost tiny: capped agent counts, shared geometries/materials, zero per-frame allocations.

**Non-Goals:**

- No fetch/ball, energy meter, drains or idle mood decay — the fetch-and-needs milestone owns those.
- No NPC dog-to-NPC dog or visitor-to-visitor interactions, no doggonomic AI beyond the spec'd behaviors.
- No audio, no saving, no time-of-day HUD clock, no player control over time.
- No new dependencies, no physics engine, no navigation meshes — waypoint and wander logic is plain math.

## Decisions

### Module layout
Four new ES modules, each owning one concern, wired by `js/states/playing.js`:
- `js/day-night.js` — owns the time-of-day scalar and lighting keyframes; mutates the existing sun/hemisphere lights, scene background and fog created by the playing state.
- `js/npc-dogs.js` — builds several NPC dogs from the shared `createDog()` with parameter sets distinct from the two selectable presets, and runs each dog's wander state machine and greet interaction state.
- `js/visitors.js` — builds the box-and-limb humans and runs their stroll/sit state machines plus notice/pet/startled reactions; exposes a bark notification entry point.
- `js/mood.js` — the minimal mood seam (see below).

*Alternative:* one `js/agents.js` for dogs and visitors — rejected: the two agent types share nothing but the update signature; separate modules keep each state machine readable.

### NPC dogs: wander state machine (Epic D7 applied)
Each NPC dog cycles `idle-pause → pick target → walk-to-target → pause/sniff → repeat`. Targets are random points inside the park radius minus margin, re-picked until not inside a prop collider. Walking reuses the locomotion math shape from `DogController` (velocity toward target at walk speed, turn-rate-limited yaw) so gaits from `DogAnimator` read the same as the player dog's. The sniff state is a new animator input: a head-down pose channel with slow tail wag, driving the shared `DogAnimator` with `{ locomotion: 'sniff' }` — one additive state in `js/anim.js`, not a new rig. Each NPC keeps its own `DogAnimator` instance (they hold only channels/weights; cheap).

Boundary and props: extract the clamp + push-out loop from `js/dog-controller.js` into a small shared helper (`applyParkClamp(position, radius, park)`) used by both the player controller and NPC dogs, so NPC dogs also never leave the park or walk through trees/benches.

*Alternative:* let NPC dogs ignore props — rejected: dogs clipping through the hydrant would immediately break the park illusion; the helper is ~15 lines.

### Greet interaction: prompt, key, choreography, cooldown
- **Prompt:** per frame, the playing state finds the nearest NPC dog within greet range (~2.2 m) of the player dog; a DOM prompt ("Press E to greet") shows/hides accordingly. Fixed bottom-center element (same pattern as the lock hint), not a projected bubble — simpler and always readable.
- **Key:** `KeyE` joins `DogController`'s game codes with `preventDefault()`, exposed as edge-triggered `consumeGreet()` next to `consumeBark()`. Input stays owned by the controller; interaction logic stays in the playing state.
- **Choreography:** a greet locks both dogs for ~1.8 s: NPC dog enters a `greet` state (turns to face the player dog, head-low sniff pose, fast tail wag); the player dog gets a matching short head-dip/tail-wag overlay driven by a timer passed into its animator update. Moving cancels. Both dogs then resume their loops.
- **Mood and cooldown:** a successful greet calls the mood seam once; the NPC dog then carries a per-NPC cooldown (~25 s, tuned) during which greets may still play but do not raise mood, exactly per the `npc-dogs` spec.

### Visitors: stroll, sit, react
- **Humans:** built in `js/visitors.js` from primitives — torso box, head box, two arm and two leg cylinder pivots at hips/shoulders, cheerful flat-shaded palette; walk = sine leg/arm swings scaled by speed (same procedural pattern as `DogAnimator`, but a lighter bespoke loop — humans only walk/sit/react). A few palette/height variations keep them distinct.
- **Waypoints:** the park's ring path (radius ~12) and the two crossing straight paths form natural waypoint loops; `createPark()` additionally returns `benches: [{ x, z, yaw }]` (seat anchors for the four benches it already places) — the park builder stays the single source of truth for layout. A visitor's loop: walk a few waypoints → pause → sometimes divert to a bench anchor, turn, sit for a while → stand → repeat. Sitting is a pose (legs folded horizontal, slight torso lean), snapped to the seat anchor.
- **Reactions (D7 applied):** three overlay states with priority startle > pet > notice:
  - *notice:* player dog within ~4 m → visitor's yaw eases toward the dog while otherwise idling/walking; releases when the dog leaves.
  - *pet:* dog within ~1.6 m, grounded and slow (calm) for ~1.2 s → visitor stops, faces the dog, plays a reach-and-pet arm animation for ~2 s; mood gain once via the seam, with a per-visitor cooldown (~25 s, tuned) mirroring the NPC dog rule so mood cannot be farmed.
  - *startled:* the playing state already consumes the bark edge each frame for the animation/bubble; it now also calls `visitors.onBark(dogPosition)`, and every visitor within ~6 m plays a step-back: a short backward offset away from the dog with a small arm raise, then resumes.

### Day/night cycle (Epic D8 applied)
A time-of-day scalar `t ∈ [0,1)` advances over a full loop of ~240 real seconds (constant in the module's tuning table), starting at mid-morning on `enter`. Keyframes at fixed `t` values each define: sun azimuth/elevation, sun color and intensity, hemisphere sky/ground colors and intensity, sky background color, fog color (fog near/far optionally). Each frame the module interpolates (colors via `THREE.Color` lerps, scalars linearly) between adjacent keyframes and writes them onto the existing lights, `scene.background` and `scene.fog` — no new scene objects, shadows keep working from the same directional light.

Night readability: keyframes keep the directional light above the horizon at all times (at night it becomes a dim, cool "moon": low intensity, high elevation, blue-white), and the hemisphere intensity never drops below a floor (~0.35), so the ground, props, dogs and visitors stay visible; dusk/dawn are short, strongly-colored keyframe bands for smooth, visible transitions.

*Alternative:* per-light sinusoidal formulas instead of keyframes — rejected: tables make dawn/dusk shaping and night floors explicit and tunable in one place (Epic D8 says interpolation tables).

### Mood seam (sibling-milestone independence)
`js/mood.js` exports a factory returning `{ value, gain(amount) }` with a clamped 0–100 float; the playing state renders it into a small HUD mood meter (bottom-left bar, DOM like the rest of the HUD). Greeting and petting call `gain()`. If the fetch-and-needs milestone has landed when this is implemented, its meters back the seam instead and this change's meter element is dropped — one wiring step in the tasks, no spec impact (the `npc-dogs`/`park-visitors` scenarios only say "the mood meter rises").

### Frame order and lifecycle
`PlayingState.update(dt)` becomes: controller → npc-dogs update → visitors update → interaction checks (prompt, greet, pet detection inputs) → day-night update → player animator → camera rig. All agent groups and the day/night state are created once in the constructor and reset/respawned on `enter`; `exit` needs no new teardown beyond what exists (agents are part of the persistent scene; nothing listens globally). Each game start begins a fresh morning — no persistence, per the Epic.

## Risks / Trade-offs

- [Frame rate drops with many animated agents] → counts capped (~3 NPC dogs, ~5 visitors per the proposal), geometries/materials shared per agent type, no per-frame allocations, animator math is closed-form sines (Epic risk plan).
- [Night too dark to play] → hemisphere floor plus moon keyframe in the table; "Nighttime stays playable" is an explicit manual check in the tasks.
- [Dawn/dusk look wrong or band] → keyframe bands tuned as pairs; manual check of one full loop; the whole look lives in one table.
- [NPC dogs get stuck on props or each other] → wander targets re-picked away from colliders, shared clamp/push-out helper, and stuck-detection (if speed ≈ 0 too long while walking, pick a new target).
- [Mood seam conflicts with the needs milestone at merge] → the seam is one tiny module with a stable call signature; the later milestone wires into it or replaces its backing — documented in both plans.
- [Prompt/greet feel flaky at range edges] → hysteresis (show prompt at 2.2 m, hide at 2.6 m) so the prompt doesn't flicker; interaction requires the dog grounded.
- [Visitors snap/pop when reaction states override strolling] → all visitor yaw/pose changes ease with the same exponential blending used elsewhere in the codebase.

## Migration Plan

All changes are new modules plus additive edits to `js/states/playing.js`, `js/dog-controller.js` (one key code + consume), `js/anim.js` (sniff/greet overlays), `js/park-builder.js` (bench anchors export), `index.html`/`css/style.css` (prompt + mood meter) and `README.md`. Reverting removes the modules and wiring; no data, saves or APIs exist to migrate. Spec-side, archiving merges the two new capability specs and the two modified requirements; the main `park-scene` spec's Purpose line (which still defers day/night to "the living-park milestone") is updated to include the cycle at archive time, since a delta cannot edit a Purpose.

## Open Questions

None that change the specs, approach or tasks — the remaining unknowns are tuning values (agent counts, radii, cooldowns, keyframe colors/times, loop length) that live in the modules' constant tables.
