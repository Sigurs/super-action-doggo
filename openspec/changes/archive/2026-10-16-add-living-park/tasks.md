# Tasks

Verification is manual — serve the site with any plain static file server and check in a desktop browser (no test tooling by design; see design.md non-goals). Each task names the check that makes it done. Scenario names refer to this change's specs under `specs/` and, for the bark scenario, to the modified `dog-control` delta.

## 1. Shared plumbing

- [x] 1.1 Implement `js/mood.js` (clamped 0–100 mood with `gain(amount)`) and a bottom-left HUD mood meter in `index.html`/`css/style.css`, wired through `js/states/playing.js`; if the fetch-and-needs milestone has already landed, back the seam with its meters instead of adding a new one; verify the meter is visible during play, rises on a temporary test gain and never overflows past full
- [x] 1.2 Extract the boundary clamp and prop push-out from `js/dog-controller.js` into a shared helper both the player controller and later agents use; verify the park-scene "Walking to the park edge" and "Walking into a tree" scenarios still pass unchanged
- [x] 1.3 Add `KeyE` to the controller's game codes with `preventDefault()` and an edge-triggered `consumeGreet()` next to `consumeBark()`; verify E does nothing on the start screen and never scrolls the page

## 2. NPC dogs

- [x] 2.1 Define ~3 NPC parameter sets for `createDog()` with colors/proportions clearly distinct from both selectable presets, spawn them at spread-out start spots, and add the additive sniff/greet pose overlays to `js/anim.js`; verify the npc-dogs "Telling dogs apart" scenario
- [x] 2.2 Implement the wander state machine (pause → pick in-bounds target away from colliders → walk → pause/sniff → repeat) with the shared clamp helper and stuck detection; verify the npc-dogs "Watching the park" scenario (walking, sniffing pauses, never leaving the park or entering props)

## 3. Greet interaction

- [x] 3.1 Implement the proximity prompt in `js/states/playing.js`: nearest NPC dog within greet range (with hysteresis) shows a bottom-center "Press E to greet" DOM prompt; verify the npc-dogs "Approaching an NPC dog" scenario (prompt appears on approach, disappears on leaving)
- [x] 3.2 Implement the greet: E triggers the ~2 s mutual interaction (NPC turns and sniffs toward the player dog, both heads dip, tails wag; moving cancels), one mood gain per successful greet, and a per-NPC cooldown (~25 s) during which greets still play but do not raise mood; verify the npc-dogs "Greeting a neighbor" and "Greeting twice in a row" scenarios

## 4. Day/night cycle

- [x] 4.1 Implement `js/day-night.js`: a time-of-day scalar looping over ~240 s from a morning start, with a keyframe table (sun position/color/intensity, hemisphere colors/intensity, sky and fog colors) interpolated every frame onto the existing lights, background and fog; verify the park-scene "Watching time pass" scenario (day → dusk → night → dawn → day, repeating, smooth dawn/dusk)
- [x] 4.2 Tune the night keyframes (moon-style directional light kept above the horizon, hemisphere intensity floor) until the park is dark but fully readable; verify the park-scene "Nighttime stays playable" scenario (dog, dogs, visitors, props and boundary all visible and controllable at night)

## 5. Visitors

- [x] 5.1 Export bench seat anchors from `js/park-builder.js` (single source of layout truth) and build ~5 varied box-and-limb human figures in `js/visitors.js` (torso/head boxes, arm/leg pivots, flat-shaded palette); verify the figures read clearly as low-poly humans in the park's style
- [x] 5.2 Implement the stroll/sit state machines: waypoint loops along the ring and crossing paths, pauses, occasional bench diversion (walk to anchor, turn, sit pose, linger, stand, resume); verify the park-visitors "Observing visitors" scenario
- [x] 5.3 Implement the notice reaction (visitor's yaw eases toward the player dog within ~4 m, releases when it leaves); verify the park-visitors "Walking up to a visitor" scenario
- [x] 5.4 Implement the pet reaction (calm dog — grounded and slow — within ~1.6 m for ~1.2 s triggers a face-and-pet animation, one mood gain, per-visitor cooldown so it cannot be farmed); verify the park-visitors "Getting petted" scenario
- [x] 5.5 Route the playing state's bark edge into `visitors.onBark(dogPosition)` and implement the startled step-back (short backward offset away from the dog, small arm raise, then resume) for visitors within ~6 m; verify the park-visitors "Barking at the bench" scenario and the modified dog-control "Barking" scenario (animation, on-screen cue, nearby visitors react)

## 6. Documentation

- [x] 6.1 Update README.md: add the greet control (E) to the controls table and refresh the game description for the living park (NPC dogs, visitors, day/night); verify the README matches the shipped behavior and the local-run instructions still work on a fresh clone

## 7. Milestone verification

- [x] 7.1 Walk every scenario in this change's `specs/npc-dogs/spec.md` and `specs/park-visitors/spec.md`, the two day/night scenarios of `specs/park-scene/spec.md`, and the modified `specs/dog-control/spec.md` bark scenario against a local static server in a desktop browser; fix anything that fails until each passes by manual check
- [x] 7.2 Play the integration loop — select dog, explore, greet an NPC dog, be petted by a visitor, bark at visitors, watch dusk fall (include fetch if the fetch-and-needs milestone has landed) — and verify a smooth frame rate with no console errors or visible hitches; if frame rate dips, lower agent counts or shadow settings per the design's tuning notes

## Workflow follow-up

- Once the fetch-and-needs milestone is also merged and the Epic branch deploys, re-run the full integration loop of task 7.2 with fetch at the deployed GitHub Pages URL (one full loop: select dog, explore, fetch, greet, be petted, bark at visitors, watch dusk fall; smooth frame rate, no console errors) — the pattern earlier milestones used for their deferred deployed-URL checks.
- Archive this change once its scenarios pass and update the main `park-scene` spec's Purpose (day/night no longer "arrives with the living-park milestone") as part of the archive.
- Verify the archived result (`openspec validate` clean; `npc-dogs` and `park-visitors` specs present under `openspec/specs/`).
