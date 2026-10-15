# Proposal

## Why

Super Action Doggo is a README title with no game. The Epic's approved plan (change `build-dog-park-game`, design decision D11) splits Phase 1 into four shippable Milestones; this change delivers Milestone 1 — the static site, the game skeleton, and the start screen with dog selection — so the project has a deployed, playable entry point that every later Milestone builds on.

## What Changes

- Add `index.html` at the repository root: an import map pinning `three` to an exact public CDN version, a full-viewport canvas, and relative-only local asset paths so the site works under a GitHub Pages repository subpath.
- Add the game skeleton: a single `requestAnimationFrame` loop, a `START`/`PLAYING` state machine, and a DOM overlay layer on top of the canvas (Epic design D1–D2, D9). Plain HTML + JS + CSS, no build step.
- Add a parameterized low-poly dog builder assembled from Three.js primitives with flat shading and no external assets (D3), plus two parameter sets producing two clearly distinct cute dogs.
- Add the start screen: title "Super Action Doggo", two rotating 3D dog previews, a visible selection highlight, the ability to change the selection, and a start control; restarting from the game returns to the start screen.
- Add a minimal placeholder playing scene that shows the chosen dog and a restart control (the full park arrives with the park-scene/dog-control card).
- Add GitHub Pages deployment via a GitHub Actions workflow (mechanism left to this Milestone by D10) and expand README.md with the game description, controls, local-run and deploy instructions.

## Capabilities

### New Capabilities

- `static-delivery`: the game as a no-build static site — entry page, CDN import map with a pinned version, working when served locally and by GitHub Pages under a repository subpath, plus a README describing and explaining how to run the game.
- `dog-selection`: the start screen that greets the player, shows the two Phase 1 dogs as rotating 3D previews, lets the player pick one, and starts the game with that dog; restarting returns to the start screen.

### Modified Capabilities

None — the repository has no existing specs.

## Impact

- All new files: `index.html`, ES modules under `js/`, styles under `css/`, and `.github/workflows/deploy.yml`; `README.md` is expanded from its title-only stub. No existing code changes.
- Runtime dependency: `three` from a public CDN at a pinned exact version, loaded via import map — no npm packages, no build tooling, no vendored libraries.
- One-time manual step outside the repository: the repo owner enables GitHub Pages with "GitHub Actions" as the source; the README documents this.

## Assumptions and open questions

- The two offered dogs are a shiba-like dog ("Mochi", cream/orange, pointed ears, curled tail) and a corgi-like dog ("Blueberry", blue-grey/white, big rounded ears, short legs, long body) — the Epic left the breeds to this Milestone.
- Pages deployment uses a GitHub Actions workflow rather than branch serving; the Epic (D10) left this mechanism to this Milestone. Enabling Pages in repo settings needs the repo owner and cannot be automated by this change.
- The dog-selection scenario "gameplay begins in the park with the chosen dog under player control" is satisfied here by a minimal placeholder playing scene (ground plane, chosen dog, restart control): the park and full dog control are the next card's scope (park-scene, dog-control).
- The pinned `three` version is fixed at implementation time to the then-current stable release on jsDelivr; the spec requires only that it be an exact pinned version.
- Desktop browsers with keyboard and mouse only; UI copy in English; no audio, no saving (per the Epic's plan).
