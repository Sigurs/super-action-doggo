# Tasks

Verification is manual — serve the site with any plain static file server and check in a desktop browser (no test tooling by design; see design.md non-goals). Each task names the check that makes it done.

## 1. Entry page as a static site

- [x] 1.1 Create `index.html` at the repository root with an import map pinning `three` to an exact jsDelivr version, a full-viewport canvas, the overlay root (`#start-screen`, `#playing-hud` sections), and relative-only references to `css/style.css` and `js/main.js`; verify from a local server (e.g. `python3 -m http.server`) that the page loads with no console errors, only local assets plus the pinned CDN module are fetched, and the repo contains no build artifacts or package files
- [x] 1.2 Add `css/style.css` with the page layout, canvas/overlay stacking and start-screen card styles; verify the overlay renders over the canvas and the layout survives a window resize

## 2. Game skeleton

- [x] 2.1 Create `js/main.js` with one `WebGLRenderer` bound to the canvas, a single `requestAnimationFrame` loop with delta time, and resize handling; verify the loop runs at frame rate with an empty scene and no per-frame console output
- [x] 2.2 Create `js/game.js` with the `START`/`PLAYING` state machine (`enter`/`exit`/`update`/`render` per state, DOM overlay sections shown/hidden per state); verify with throwaway scenes that switching states swaps scene and overlay without a page reload
- [x] 2.3 Remove the throwaway scenes once real states exist (end of group 5) and verify the state machine still starts in `START` on every fresh load

## 3. Parameterized dog builder

- [x] 3.1 Implement `js/dog-builder.js`: `createDog(params)` assembling a dog from flat-shaded Three.js primitives, parameterized for body proportions, colors, ear shape and tail type, with no external assets; verify a default dog renders in a scratch scene
- [x] 3.2 Implement `js/anim.js` idle helper (tail wag, breathing bob) driving named parts of the built dog; verify the dog idles visibly (wagging tail, gentle bob) rather than being frozen
- [x] 3.3 Add the two presets — Mochi (shiba-like: cream/orange, pointed ears, curled tail) and Blueberry (corgi-like: blue-grey/white, big rounded ears, short legs, long body); verify both render side by side and are distinguishable at a glance (the dog-selection "Comparing the offered dogs" scenario)

## 4. Start screen with dog selection

- [x] 4.1 Implement `js/states/start.js`: one preview scene with both dogs on rotating turntables, a stage, hemisphere + directional light; verify both previews turn continuously, showing each dog from multiple angles over a few seconds
- [x] 4.2 Wire the start screen DOM: title "Super Action Doggo", two clickable dog cards (left/right halves), a selection state with an in-scene highlight ring under the chosen dog plus a highlighted card style, first dog selected by default; verify the "Loading the game" and "Selection is highlighted" scenarios
- [x] 4.3 Implement selection changes (clicking a card or the other dog selects it) and the Start control; verify the "Switching dogs" scenario — the highlight follows every change before starting

## 5. Playing placeholder and restart

- [x] 5.1 Implement `js/states/playing.js`: ground plane, sky-colored background, the chosen dog (from the preset passed on start) with the idle animation centered, HUD strip with the dog's name and a "Back to start" button; verify the "Starting the game" scenario — gameplay begins showing exactly the chosen dog
- [x] 5.2 Wire restart back to `START`; verify the "Restarting returns to dog selection" scenario, including starting the next round with the other dog, with no page reload at any point

## 6. README and GitHub Pages deployment

- [x] 6.1 Expand README.md with the game description, Play link, current controls, local-run instructions and Pages deployment steps; verify on a fresh clone that following the local-run instructions serves and plays the game with no further setup details (the static-delivery "A newcomer follows the README" scenario)
- [x] 6.2 Add `.github/workflows/deploy.yml` (push to `master` + manual dispatch: configure-pages, upload only `index.html`/`js/`/`css/`, deploy-pages); verify the workflow file is valid YAML with correct permissions and that a manual dispatch after enabling Pages succeeds
- [ ] 6.3 After the repo owner enables Pages with source "GitHub Actions", verify the game loads and plays at the Pages URL under its `/super-action-doggo/` subpath with no missing assets (the "Playing the deployed game" scenario)

## 7. Milestone verification

- [x] 7.1 Walk every scenario in `specs/static-delivery/spec.md` and `specs/dog-selection/spec.md` of this change against a local server, fixing anything that fails; verify each scenario passes by manual check in a desktop browser
- [ ] 7.2 Repeat the walkthrough at the deployed Pages URL once available (task 6.3) and confirm both specs' scenarios pass there too; verify reloading the page loads the same pinned `three` version ("Version stays stable across reloads")

## Workflow follow-up

- Archive this change once its scenarios pass locally and at the Pages URL.
- Verify the archived result (`openspec validate` clean, specs present under `openspec/specs/`).
