# Tasks

Verification is manual — serve the repository root with a plain static file server (e.g. `python3 -m http.server 8000`) and check in the project's headless browser; the project has no test tooling by design. Each task names the check that makes it done. Scenario names refer to this change's `specs/park-visitors/spec.md`.

## 1. Hair/head fit in the shared visitor builder

- [x] 1.1 In `buildVisitor` (`js/visitors.js`), change the shared hair geometry and/or `hair.position.set(...)` so no hair face is coplanar with a head face (push the hair back and/or shorten its depth by a small named clearance), keeping the hair a cap that still overhangs the head top and sides; verify by code inspection that the head/hair constants are the only changes and that `GEOMETRIES` head, torso, leg and arm entries, the outfit table, `createVisitors`, `updateVisitor`, `applyPose`, `onBark` and `reset` are untouched
- [x] 1.2 Compute/confirm the two front-face z values differ by the clearance and that no other visitor part shares a plane (head `z = ±0.105`; hair top/sides/back/bottom vs head/arm/torso/leg planes), so the requirement holds for the whole figure and not just the head
- [x] 1.3 Serve the site, spawn into the park, and look at a visitor's head from the front, the sides and above in the browser; confirm the hair is a solid cap with no flickering where it meets the head and that it does not look detached or floating
- [ ] 1.4 If flicker persists at distance or the clearance looks wrong, adjust the clearance constant (and hair depth if needed) to the smallest value that removes the flicker without a visible gap and re-check; stop tuning once no flicker is visible

## 2. Visual verification across visitors, angles and motion

- [ ] 2.1 Capture screenshots of standing visitors from front, side and above under `.siggydev/visual-check/` and run the visual-check subagent on them: PASS on the park-visitors "Inspecting a visitor's head" scenario — hair renders as one solid cap on every visitor checked, no flickering or patchy surface
- [ ] 2.2 Verify the park-visitors "Watching a visitor move" scenario: watch several visitors walk, turn, sit and react over a stretch of game time and screenshot them mid-motion; the visual check confirms no part of the head or hair shimmers or flickers as the camera and visitor move
- [ ] 2.3 Regression pass: confirm no console errors during a short play session, all five visitors still walk, sit on benches, notice the dog, get petted and startle on bark unchanged, and the rest of the visitor's look (box style, colors, hair colors, scales, arms, legs, torso) is unchanged

## Workflow follow-up

- Archive this change once both scenarios in `specs/park-visitors/spec.md` pass; archiving adds the new requirement to the existing `openspec/specs/park-visitors/spec.md`.
- Verify the archived result (`openspec validate` clean; the added requirement present under `park-visitors` and the other specs untouched).
