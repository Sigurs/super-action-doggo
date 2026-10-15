# Design

## Context

The repository is greenfield: a README with the game title and an initialized `openspec/` directory, nothing else. The proposal fixes the stack: Three.js from a CDN via an import map, plain static files, no build step, deployed on GitHub Pages. Everything in Phase 1 is new code in a small static site; the specs under `specs/` define the required behavior.

## Goals / Non-Goals

**Goals:**

- A browser game structure that is simple to extend in later phases (more dogs, props, activities) without refactors.
- All 3D content produced in code from primitives, so no asset pipeline is needed.
- 60 fps on an integrated GPU with a handful of NPCs.

**Non-Goals:**

- No build tooling, bundler, transpiler, TypeScript, or package manager — the committed files are the served files.
- No audio, no saving, no progression, no mobile/touch input, no multiplayer.
- No physics engine — bespoke gravity and ground logic are enough for one dog and one ball.

## Decisions

### D1: Site layout and library loading
`index.html` at the repository root plus a `js/` directory of ES modules; styles and HUD as plain CSS in a `css/` directory. `index.html` carries an import map pinning `three` (and only `three`) to an exact version on a public CDN (jsDelivr or unpkg). All site paths are relative so the site works under a GitHub Pages repository subpath.

*Alternative:* vendor `three` into the repo — rejected for Phase 1: no build step still allows copying the module in, but it bloats the repo and the card's stack says HTML + JS with CDN being the accepted approach; vending can be a later change if CDN reliance hurts.

### D2: One page, two application states
A single `requestAnimationFrame` loop drives everything. A tiny state machine switches between `START` (start screen) and `PLAYING` (park). The start screen is a DOM overlay rendered on top of a small Three.js scene showing the two selectable dogs (rotating previews); the chosen dog configuration object is passed into the park scene on start. Restart from the park returns to `START`. This keeps one renderer and one canvas for the whole game.

### D3: Procedural low-poly models, no assets
Dogs, humans, trees, props and the ball are built from Three.js primitives (`BoxGeometry`, `CylinderGeometry`, `SphereGeometry`, cones) with flat-shaded `MeshStandardMaterial`/`MeshLambertMaterial` in a cheerful palette. A parameterized dog builder takes proportions and colors, so the two selectable dogs and all NPC dogs share one builder with different parameters. Humans are simple box-and-limb figures. This is the main trick that keeps the project asset-free.

### D4: Procedural animation instead of skeletal rigs
Dog states (idle, walk, trot, jump, sit, bark, sniff) are expressed as code-driven transforms: leg swings on sine curves scaled by speed, body bob, tail wag, head poses for sit/bark/sniff. NPC dogs and visitors reuse the same helpers. No `AnimationMixer` clips or rigs.

### D5: Camera and input scheme
Camera: third-person rig — a pivot on the dog with yaw/pitch orbit driven by mouse movement using the Pointer Lock API (engaged on click into the canvas; `Esc` releases it). Keyboard: WASD/arrows to move relative to camera yaw, `Shift` to run, `Space` to jump, plus single-tap action keys for sit and bark. Throw: hold the left mouse button to charge, release to throw along the camera's aim. Movement is a camera-relative direction, so mouse steering and running compose naturally.

*Alternative:* on-rails camera or click-to-move — rejected: the card asks for keyboard and mouse control, and orbit-follow is the genre-standard feel.

### D6: Bespoke movement, ground and boundary logic
The park ground is a plane at `y = 0`; gravity is a constant applied to the dog and the ball. Ball bounce is a damped vertical reflection plus friction on ground contact. The playable area is a simple shape (circle or rectangle) and movement clamps to it, satisfying the park-bound requirement. No collision meshes beyond a few prop-radius checks (trees, benches) that push the dog out.

### D7: Agent behaviors as small state machines
- NPC dogs: `wander → walk-to-point → pause/sniff → repeat`, plus a greet interaction triggered by player proximity and prompt.
- Visitors: waypoint paths along park paths, `walk → pause → bench-sit`, reaction states (`notice`, `pet`, `startled`) triggered by the player's dog proximity or bark.
- Interactions use per-agent cooldowns so mood cannot be farmed (per specs `npc-dogs`, `park-visitors`).

### D8: Needs and time-of-day as frame-updated scalars
Mood and energy are 0–100 floats. Drains/recovery rates per activity (running, jumping, fetch complete, greeting, petting, idling) live in one tuning table. Day/night is a time-of-day scalar looping over a few real minutes, driving directional-light position/color/intensity, ambient light and sky/fog colors; interpolation tables keep dawn/dusk smooth and night readable (per specs `dog-needs`, `park-scene`).

### D9: HUD, prompts and cues as DOM overlay
Meters (mood, energy), interaction prompts and the visual bark cue are HTML/CSS elements positioned over the canvas — cheaper to build and style than in-scene UI, and consistent with the no-build decision.

### D10: Deployment
GitHub Pages serving the static files as committed (Pages enabled on the repository; exact mechanism — branch root vs GitHub Actions workflow — decided in the delivery Milestone). Verification is manual: serve locally with any static server and check the deployed Pages URL after enabling.

### D11: Milestone breakdown
Four Milestones, each shippable on its own:

1. **Site and start screen** — static-delivery + dog-selection specs: entry page, import map, loop/state machine skeleton, start screen with two dog previews, README, Pages deployment.
2. **Park and dog control** — park-scene + dog-control specs: park world, procedural dog models and animation, camera rig, movement/actions, boundary.
3. **Fetch and needs** — fetch-play + dog-needs specs: ball throw/fetch/return, HUD meters, energy/mood tuning.
4. **Living park** — npc-dogs + park-visitors specs: NPC dogs with greeting, visitors with reactions, day/night cycle.

3 builds on 2; 4 builds on 2 and is independent of 3 apart from mood effects that 3's meters already expose.

## Risks / Trade-offs

- [CDN unavailable or slow → page cannot render] → pin an exact version on a major CDN; if it becomes a real problem, a later change can vendor the library without touching game code (one import-map line).
- [Pointer Lock has browser quirks (needs user gesture, `Esc` exits)] → engage lock on click, pause-free fallback to drag-to-orbit if lock is denied; prompts shown when the pointer is not locked.
- [No build step means no automated tests or linting wired in] → keep modules small and dependency-light; verify each Milestone with a manual checklist against its spec scenarios.
- [Procedural animation can look stiff] → prioritize readable silhouettes and per-state poses (sit, bark, sniff) over smoothness; low-poly style forgives much.
- [Performance drop from many animated agents] → cap NPC counts (a few dogs, a handful of visitors), reuse geometries/materials, avoid per-frame allocations.
- [Relative paths break if the site is moved] → keep everything relative and test at a subpath before each deploy.

## Open Questions

- Which two dog breeds the start screen offers and the exact park prop list — safely decided inside Milestones 1 and 2 without touching the specs.
- Circle vs rectangle park boundary — a Milestone 2 implementation detail.
