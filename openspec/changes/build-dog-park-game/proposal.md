# Proposal

## Why

The repository is empty except for a title-only README: Super Action Doggo has no game yet. This change plans Phase 1 of the game as a whole — a browser-based, low-poly 3D dog park life simulator — so the Epic can be delivered in coherent, individually shippable Milestones.

## What Changes

- Add a static web app (plain HTML + JS, no build step) that loads Three.js from a CDN via an import map and runs entirely client-side.
- Add a start screen with dog selection: two cute low-poly dogs to choose from, then start the game.
- Add a low-poly 3D park scene the dog explores, with grass, paths, trees, park props and a bounded play area.
- Add player dog control: third-person camera, keyboard movement (walk/run/jump) and actions (sit, bark).
- Add fetch play: the player throws a ball with the mouse; the dog chases, grabs and returns it.
- Add dog needs: mood and energy meters that activities raise or drain.
- Add a living park: NPC dogs that roam and can be greeted/sniffed, human park visitors that stroll and react to the dog, and a day/night cycle.
- Add GitHub Pages deployment and a simple README.md describing the game and how to run and deploy it.
- No progression, saves, story, mobile/touch support or audio in Phase 1.

## Capabilities

### New Capabilities

- `static-delivery`: the game as a no-build static site — entry page, CDN import map, working when served by GitHub Pages (including repo subpath), plus README.
- `dog-selection`: start screen where the player picks between two cute low-poly dogs and starts the game.
- `park-scene`: the low-poly 3D park world the game takes place in, including its day/night cycle.
- `dog-control`: keyboard and mouse control of the player dog — movement, jump, sit, bark, third-person camera.
- `fetch-play`: throwing a ball with the mouse and the dog fetching and returning it.
- `dog-needs`: mood and energy meters that activities and time affect, shown in the HUD.
- `npc-dogs`: non-player dogs roaming the park that the player's dog can greet and sniff.
- `park-visitors`: human visitors strolling in the park who react to the player's dog.

### Modified Capabilities

None — the repository has no existing specs.

## Impact

- All new code: `index.html`, JS ES modules (renderer, game loop, scene, dog models, NPCs, UI/HUD), and a GitHub Pages deployment setup; no existing code or APIs change.
- Runtime dependency: Three.js from a CDN (pinned version) via import map — no npm packages, no build tooling.
- Repo layout grows from a README-only repo to a small static site; README.md is expanded with run/deploy instructions.

## Decisions

- **3D rendering: Three.js**, loaded from a CDN via an import map. Chosen over Babylon.js and raw WebGL for its low-poly fit and ecosystem.
- **Delivery: plain static files, no build step.** No Vite/npm bundling; files are served by GitHub Pages exactly as committed.
- **Phase 1 scope is "lively"**: movement and actions (walk/run/jump/sit/bark), mouse-thrown ball fetch, mood/energy meters, NPC dogs to greet/sniff, human park visitors that react to the dog, and a day/night cycle. No progression.

## Assumptions and open questions

- Desktop browsers with keyboard and mouse are the only supported input; no touch or gamepad support in Phase 1.
- All 3D content (dogs, humans, trees, props, ball) is built procedurally from Three.js primitives — no external model or texture assets; which two dog breeds the start screen offers is left to the Milestone that builds it.
- Third-person follow camera steered by the mouse; exact key bindings follow genre convention (WASD/arrows, Shift to run, Space to jump) and are a Milestone detail.
- No audio in Phase 1.
- No saving or persistence of any kind (fits "no progression").
- Exact GitHub Pages mechanism (deploying from a branch vs a GitHub Actions workflow) is left to the delivery Milestone; the spec only requires the site to work at the Pages URL.
- UI copy is English.
