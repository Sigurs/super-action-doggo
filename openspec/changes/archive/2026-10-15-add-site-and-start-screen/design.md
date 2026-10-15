# Design

## Context

The repository is greenfield: a title-only README and an initialized `openspec/` directory. The Epic's approved plan (`.siggydev/parents/sad-1/`, change `build-dog-park-game`) fixes the stack — Three.js from a CDN via an import map, plain static files, no build step, GitHub Pages — and its decisions D1–D3, D9 and D10 govern this card directly. This design adds the card-level decisions D10 leaves open (Pages mechanism, dog breeds) and lays out the module structure for the site skeleton and start screen.

## Goals / Non-Goals

**Goals:**

- A site and code skeleton that later Milestones (park scene, dog control, fetch, NPCs) extend without refactors: one renderer, one loop, one state machine, one dog builder shared by player and NPC dogs.
- Everything asset-free: dogs from Three.js primitives, flat-shaded, so the committed files are the whole game.
- Start screen that reads as a game menu, not a tech demo: title, two rotating cute dogs, clear selection, start.

**Non-Goals:**

- No park world, movement, camera rig, actions, fetch, needs, NPCs or day/night — later cards own those.
- No build tooling, TypeScript, npm packages, tests or linting wired in (Epic non-goal); verification is a manual checklist against the spec scenarios.
- No mobile/touch support, no audio, no saving.

## Decisions

### Site layout and library loading (Epic D1 applied)
`index.html` at the repository root; ES modules under `js/`; styles in `css/style.css`. The import map pins only `three` to an exact version on jsDelivr (`https://cdn.jsdelivr.net/npm/three@<exact-version>/build/three.module.js`); no `three/addons` mapping is needed for this card. The exact version is chosen at implementation time as the then-current stable release (known-good baseline: `0.170.0`) and stays a fully pinned version — no `@latest`, no ranges. All repository-local references (`js/main.js`, `css/style.css`) are relative paths, so the site works under the Pages subpath `/super-action-doggo/`.

*Alternative:* vendor `three` into the repo — rejected by the Epic (D1) for Phase 1; the import map makes vendoring a one-line change later.

### Module structure
- `js/main.js` — bootstrap: creates the renderer bound to the canvas, one `requestAnimationFrame` loop with delta time, resize handling, hands frames to the game.
- `js/game.js` — the `START`/`PLAYING` state machine. Each state is an object with `enter(opts)`, `exit()`, `update(dt)`, `render(renderer)`; the game owns which state is active and swaps scenes without page reloads. `START → PLAYING` passes the chosen dog preset; `PLAYING → START` (restart) passes nothing.
- `js/states/start.js` — start screen scene + selection logic; `js/states/playing.js` — placeholder playing scene.
- `js/dog-builder.js` — `createDog(params): THREE.Group` and the two presets; `js/anim.js` — tiny shared idle-animation helper (tail wag, breathing bob) reused by both scenes, the seed of the Epic's D4 procedural animation.
- DOM overlay: static sections in `index.html` (`#start-screen`, `#playing-hud`) shown/hidden with CSS classes per state — cheaper than rebuilding DOM, consistent with Epic D9.

*Alternative:* one growing `script.js` — rejected: later Milestones add scenes and agents, so per-state modules and a shared builder pay off immediately.

### One renderer, two scenes (Epic D2 applied)
A single `WebGLRenderer` and canvas serve all states; each state owns its own `Scene`/`Camera`. The loop always runs; only the active state updates and renders. The start screen's DOM overlay sits on top of the canvas (`pointer-events` managed per state so clicks reach cards and buttons but the canvas stays visible behind).

### Start-screen previews: one scene, two turntables
Both dogs stand side by side in one preview scene on a small stage, each in its own rotating group (constant Y rotation, opposite directions for liveliness), lit by one hemisphere light and one directional light. The DOM presents two clickable "cards" covering the left and right halves of the screen — the cards are the click targets, so exact dog-on-screen alignment never has to be pixel-perfect. Selection state is an index; selecting a card updates a highlight ring under the chosen dog (a flat `RingGeometry` on the ground) plus a CSS class on the card. The Start button (DOM) starts the game with the selected preset. Keyboard niceties (arrow keys to switch, Enter to start) are optional extras, not requirements.

*Alternative:* two renderers or scissor-test viewports — rejected: more moving parts for zero visual gain at two dogs.

### Parameterized dog builder and the two dogs (Epic D3 applied)
`createDog(params)` assembles a dog from boxes, cylinders, spheres and cones with `flatShading: true` materials. Parameters cover body proportions (leg length, body length/height), colors (body, belly/chest, ears, tail), ear shape (pointed triangle vs rounded upright), tail type (curled disc vs straight tapered) and snout size. Two presets, both cute and distinguishable at a glance:
- **Mochi** — shiba-like: cream body with orange-tan back, small pointed ears, curled tail, compact proportions.
- **Blueberry** — corgi-like: blue-grey body with white chest and paws, big rounded ears, straight short tail, short legs and long body.

The same builder later produces NPC dogs with other parameter sets, so no modelling work is duplicated.

### Placeholder playing scene
`PLAYING` shows a green ground plane, a sky-colored clear color, the chosen dog centered with the idle animation, and a HUD strip with the dog's name and a "Back to start" restart button. No movement, camera rig or interactions — those arrive with the park-scene/dog-control card, which replaces this scene wholesale. This keeps the state machine, overlay plumbing and restart flow exercised and verifiable now.

### Deployment: GitHub Actions workflow (Epic D10 decided)
`.github/workflows/deploy.yml` runs on push to `master` (plus manual dispatch): checkout → `actions/configure-pages` → `actions/upload-pages-artifact` with only the site files (`index.html`, `js/`, `css/`) → `actions/deploy-pages`. Permissions `contents: read`, `pages: write`, `id-token: write`. Chosen over branch-root serving because it deploys exactly the site files regardless of what else lives in the repo and is GitHub's recommended mechanism. Enabling Pages (Settings → Pages → Source: GitHub Actions) is a one-time manual step for the repo owner, documented in the README.

### README
Expanded to cover: one-paragraph game description, a Play link to the Pages URL, current controls (select dog, start, restart — with a note that park controls arrive in the next milestone), local run (`python3 -m http.server` or `npx serve` from the clone root), and deployment (enable Pages with GitHub Actions source; the workflow deploys on push to `master`).

## Risks / Trade-offs

- [CDN unavailable or slow → page cannot render] → exact-pinned version on jsDelivr; vendoring later is a one-line import-map change (Epic risk plan).
- [Import maps unsupported in an old browser → blank page] → acceptable: desktop evergreen browsers are the Phase 1 target; README states the requirement.
- [DOM cards drift from the 3D dogs on unusual aspect ratios] → the half-screen cards are the click targets and the highlight ring is in-scene, so misalignment cannot break selection.
- [Pages cannot be enabled by code → deployed-URL scenario unverifiable until the owner acts] → README documents the one-time step; local-server verification covers everything else first.
- [No automated tests → regressions slip in] → each task verifies against named spec scenarios by manual check in a desktop browser, per the Epic's verification approach.

## Migration Plan

All new files plus a README expansion; nothing to migrate or roll back — reverting the commit restores the title-only README. Pages deployment activates whenever the owner enables it; until then the site is still verifiable locally.

## Open Questions

None — remaining unknowns (exact pinned `three` version number, final dog palette shades) are implementation-time details that do not affect the specs, approach or tasks.
