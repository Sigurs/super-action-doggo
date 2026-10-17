# Tasks

Verification is manual — serve the repository root with a plain static file server (e.g. `python3 -m http.server 8000`) and check in the project's headless browser; the project has no test tooling by design. Each task names the check that makes it done. Scenario names refer to this change's `specs/dog-model/spec.md`.

## 1. Foot assembly fix in the shared builder

- [x] 1.1 In `buildLegs` (`js/dog-builder.js`), shorten each leg cylinder to `legHeight − legRadius * 0.6` (keeping its top at pivot-local y = 0) so the bottom rim ends at the paw's equator while the paw mesh, pivot positions and all other proportions stay untouched; verify by code inspection that nothing outside `buildLegs` changes (no edits to `createDog`, presets, exports or other modules)
- [x] 1.2 Serve the site, start a run with each player preset (Mochi, Blueberry), and check in the browser that every leg ends in a white paw with no leg tip or seam crossing it and that the dogs' stance on the ground is unchanged (no sinking, floating or changed leg spread)
- [x] 1.3 If any view still shows the leg through the paw (low-poly facet dip), widen the paw radius factor from `1.35` up to at most ~`1.45` per the design's tuning knob and re-check; stop tuning once no seam is visible

## 2. Visual verification across dogs, angles and motion

- [x] 2.1 Capture screenshots of a standing player dog from front, side and rear camera angles under `.siggydev/visual-check/` (start screen previews or in-park views) and run the visual-check subagent on them: PASS on the dog-model "Inspecting a standing dog from any angle" scenario — each leg ends in a white paw, no leg-colored geometry breaks through the white part on any leg
- [x] 2.2 Verify the dog-model "Dogs of different builds" scenario: screenshot a short-legged dog (Blueberry or the NPC Basil) and a long-legged dog (Mochi or the NPC Biscuit) near each other in the park and confirm via the visual check that both builds show clean paws
- [x] 2.3 Verify the dog-model "Watching a dog move" scenario: walk, run, sit and jump the player dog and watch an NPC dog wander; confirm the paws stay clean white socks through the motion with no popping or separation at the ankle
- [x] 2.4 Verify the dog-model "Turning a start-screen preview" scenario: let the start-screen preview turn for a few seconds for both dogs and screenshot it mid-turn; the visual check confirms clean paws from every angle of the turn
- [x] 2.5 Regression pass: confirm no console errors during a short play session, and that the rest of the dog's look (leg thickness, colors, belly, head, tail) and the npc-dogs "Telling dogs apart" / dog-selection "Comparing the offered dogs" scenarios are unchanged

## Workflow follow-up

- Archive this change once every scenario in `specs/dog-model/spec.md` passes; archiving creates the main `openspec/specs/dog-model/spec.md` from this change's delta, Purpose included.
- Verify the archived result (`openspec validate` clean; the `dog-model` spec present under `openspec/specs/`, existing specs untouched).
