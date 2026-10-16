# Tasks

Verification is manual — serve the repository root with a plain static file server (e.g. `python3 -m http.server 8000`) and check in the project's headless browser; the project has no test tooling by design. Each task names the check that makes it done. Scenario names refer to this change's `specs/fps-counter/spec.md`.

## 1. Counter element and styling

- [x] 1.1 Add `<div id="fps-counter">-- FPS</div>` inside the `#playing-hud` section in `index.html`, make `.hud-strip` `position: relative`, and style `#fps-counter` as an absolutely positioned HUD pill (`top: calc(100% + 0.5rem); right: 1.4rem;` from the strip, dark translucent pill, white HUD type, `pointer-events: none`) in `css/style.css`; serve the site, start a run, and verify the placeholder pill renders directly below the top strip, right-aligned with the strip's content, overlapping nothing at a normal and a small window size
- [x] 1.2 Verify by inspection that the counter inherits the existing HUD font and colour palette (same family, white text, `rgba(38, 48, 59, 0.55)` pill as the lock hint and mood meter) and introduces no new font, colour or shadow values

## 2. FPS sampling and refresh

- [x] 2.1 Implement the sampler in `js/states/playing.js`: bind the element in `bindElements()`, count one frame per `update()` call against a `performance.now()` window, and every ~0.5 s write `Math.round(frames / seconds)` as `N FPS`; reset the counters and re-show `-- FPS` in `enter()`; verify during play that the reading refreshes about twice a second (not every frame), is a whole number, and sits close to the rate the game visibly runs at
- [x] 2.2 Verify the fps-counter "No counter on the start screen" scenario: on the start screen, and again after clicking **Back to start** mid-run, no counter is visible and it returns on the next run — with no edits to `js/game.js` or `js/states/start.js`

## 3. Browser and visual verification

- [x] 3.1 With the game served, open it in the project's headless browser, click **Start**, wait ~1 s for the first sampled value, and save screenshots of the start screen and of the playing screen under `.siggydev/visual-check/`; run the visual-check subagent on both and verify PASS: the counter (a legible `N FPS` pill) is visible in the top-right only on the playing screen, absent on the start screen
- [x] 3.2 Repeat the playing-screen screenshot at one small and one large viewport and have the visual check verify the fps-counter "Sharing the top-right corner" scenario: the counter overlaps neither the HUD strip (dog name, Back to start) nor the greet prompt, look-around hint, mood meter or bark bubble
- [x] 3.3 Play for a minute (move, jump, bark, greet an NPC dog) and verify the counter keeps updating about twice a second with no console errors and no visible hitch introduced by the DOM writes

## Workflow follow-up

- Archive this change once every scenario in `specs/fps-counter/spec.md` passes; archiving creates the main `openspec/specs/fps-counter/spec.md` from this change's delta, Purpose included.
- Verify the archived result (`openspec validate` clean; the `fps-counter` spec present under `openspec/specs/`).
