# Tasks

Each group below corresponds to one Milestone of the Epic (see design.md, D11). Verify behavior against the scenarios in the named spec files; verification is manual — serve the site with any static file server and check in a desktop browser.

## 1. Milestone 1 — Site and start screen (specs: static-delivery, dog-selection)

- [ ] 1.1 Create `index.html` with an import map pinning `three` to an exact CDN version, a canvas, and relative asset paths only; verify the page loads the library and renders an empty scene from a local static server
- [ ] 1.2 Add the game skeleton: single `requestAnimationFrame` loop, `START`/`PLAYING` state machine, DOM overlay layer; verify the state machine switches scenes without page reloads
- [ ] 1.3 Build the parameterized low-poly dog builder (procedural primitives, two parameter sets); verify two clearly distinct cute dogs render side by side
- [ ] 1.4 Build the start screen: title, two rotating 3D dog previews, selection highlight, change-selection, start control; verify all `dog-selection` scenarios, including restart returning to the start screen
- [ ] 1.5 Set up GitHub Pages deployment (branch or Actions per design D10) and expand README.md with description, controls, local-run and deploy instructions; verify the game plays at the Pages URL under its subpath and the README's run instructions work on a fresh clone

## 2. Milestone 2 — Park and dog control (specs: park-scene, dog-control)

- [ ] 2.1 Build the park world: ground with grass and paths, trees, park props, low-poly style; verify the `park-scene` "Looking around" scenario
- [ ] 2.2 Implement the bounded play area and prop collision push-out; verify the dog cannot leave the park and cannot walk through trees/benches
- [ ] 2.3 Implement the third-person camera rig with pointer-lock mouse orbit and a drag fallback; verify camera orbit and follow scenarios in `dog-control`
- [ ] 2.4 Implement movement: camera-relative walk, run with visible gait change, stop-to-idle; verify the movement, running and stopping scenarios
- [ ] 2.5 Implement jump with gravity and landing lock-out; verify the jumping scenario
- [ ] 2.6 Implement sit and bark actions with procedural poses and an on-screen bark cue; verify sit/stand-up and bark scenarios

## 3. Milestone 3 — Fetch and needs (specs: fetch-play, dog-needs)

- [ ] 3.1 Implement charge-and-release mouse throw with arc, bounce and roll physics; verify the throwing scenario and that only one ball exists at a time
- [ ] 3.2 Implement ball pick-up and mouth carry; verify the dog visibly carries the ball after reaching it
- [ ] 3.3 Implement ball return and drop near the throw origin; verify a full throw→fetch→return cycle can repeat indefinitely
- [ ] 3.4 Add the HUD mood/energy meters; verify both meters are visible and read between empty and full
- [ ] 3.5 Implement energy drain/recovery, low-energy no-run/no-jump, mood gains (fetch complete) and idle mood decay with clamping; verify every `dog-needs` scenario

## 4. Milestone 4 — Living park (specs: npc-dogs, park-visitors, park-scene day/night)

- [ ] 4.1 Implement NPC dog wandering (walk, pause, sniff, stay in bounds) from the shared dog builder; verify the roaming and "visibly dogs" scenarios in `npc-dogs`
- [ ] 4.2 Implement greet/sniff interaction: proximity prompt, mutual interaction, mood gain, per-NPC cooldown; verify all `npc-dogs` scenarios
- [ ] 4.3 Implement visitors strolling paths and sitting/lingering on props; verify the observing scenario in `park-visitors`
- [ ] 4.4 Implement visitor reactions: notice nearby dog, pet a calm close dog (mood gain), startle on bark; verify all reaction scenarios
- [ ] 4.5 Implement the continuous day/night cycle driving lights and sky with readable nights; verify both `park-scene` day/night scenarios
- [ ] 4.6 Final integration pass: play one full loop — select dog, explore, fetch, greet, be petted, bark at visitors, watch dusk fall — at the deployed Pages URL; verify smooth 60 fps feel and no console errors

## Workflow follow-up

- Archive this change once all Milestones are merged and the final integration check passes.
- Verify the archived result (`openspec validate` clean, specs present under `openspec/specs/`).
