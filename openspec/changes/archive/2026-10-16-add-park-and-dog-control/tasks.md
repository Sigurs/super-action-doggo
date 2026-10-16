# Tasks

Verification is manual — serve the site with any plain static file server and check in a desktop browser (no test tooling by design; see design.md non-goals). Each task names the check that makes it done. Scenario names refer to this change's specs under `specs/`.

## 1. Animatable dog rig

- [x] 1.1 Refactor `js/dog-builder.js` so each leg sits in a named pivot group at its hip (swing via pivot rotation); keep `createDog(params)`/`disposeDog` and both presets unchanged; verify the start screen still renders and idles both dogs as before (dog-selection scenarios still pass)
- [x] 1.2 Extend `js/anim.js` with the pose-target easing system plus idle/walk/run gaits driven by a speed parameter (diagonal-pair walk, gallop run with body bob); verify in a scratch scene that leg swings scale with speed and walk vs run read as visibly different gaits

## 2. Park world

- [x] 2.1 Implement `js/park-builder.js`: `createPark()`/dispose building the grass ground, ring and crossing paths, tree variants, benches, bushes, rocks, fire hydrant and fence ring from shared flat-shaded primitives, returning the play-area radius and the prop collider list; verify in a scratch scene that the park shows grass, paths, trees and recognizable props in a consistent low-poly style
- [x] 2.2 Rewrite `js/states/playing.js` around the park: daytime lights, sky and fog, park group added, the chosen dog spawned at a start spot, existing HUD and restart flow kept; verify the park-scene "Looking around the park" scenario and the dog-selection "Starting the game" (park version) and "Restarting returns to dog selection" scenarios

## 3. Third-person camera

- [x] 3.1 Implement `js/camera-rig.js`: smoothed pivot tracking the dog, yaw/pitch/dist spherical offset, pitch clamped above the ground; verify in a scratch test that the camera holds behind/above the dog and keeps it on screen while the dog moves
- [x] 3.2 Wire pointer lock on the playing state: click into the canvas requests lock, mouse deltas orbit, `Esc` releases, left-drag orbits when unlocked or denied, and a HUD hint shows while unlocked; verify the dog-control "Orbiting the camera" scenario in both locked and drag-fallback modes

## 4. Dog movement, boundary and props

- [x] 4.1 Implement the input layer in `js/dog-controller.js`: `event.code` key map (WASD/arrows, Shift run, Space jump, C sit, B bark), edge-triggered jump/bark, `preventDefault()` on game keys, listeners added on `enter` and removed on `exit`; verify keys do nothing on the start screen and Space/arrows never scroll the page
- [x] 4.2 Implement camera-relative movement with velocity easing, smooth turning toward the movement direction, walk/run speeds from the tuning table, and stop-to-idle; verify the "Walking in a direction", "Stopping", "Running across the park" and "Following a moving dog" scenarios
- [x] 4.3 Implement boundary clamping to the park radius and prop push-out from the collider list; verify the park-scene "Walking to the park edge" and "Walking into a tree" scenarios (the dog never leaves the park and never enters a tree, bench or hydrant)

## 5. Actions

- [x] 5.1 Implement jump: bespoke gravity integration, Space only while grounded, landing at `y = 0` re-grounds the dog, no second jump until landed, plus the leg-tuck jump pose; verify the "Jumping" scenario
- [x] 5.2 Implement sit: C folds the dog into the sitting pose (hind legs folded, torso pitched up) and the pose holds until a movement key stands the dog up and moves; verify the "Sitting" and "Standing back up" scenarios
- [x] 5.3 Implement bark: B triggers the bark pose (head snap with body recoil) and a DOM "Woof!" bubble projected at the dog's head position with a short CSS pop; verify the "Barking" scenario — animation and on-screen cue both clearly visible, barkable while idle and while sitting

## 6. Documentation

- [x] 6.1 Update README.md: replace the "movement and park controls arrive with the next milestone" note with the full controls table (move, run, jump, sit, bark, camera/pointer lock); verify the README's controls match the shipped bindings and the local-run instructions still work on a fresh clone

## 7. Milestone verification

- [x] 7.1 Walk every scenario in this change's `specs/park-scene/spec.md` and `specs/dog-control/spec.md`, plus the modified dog-selection "Starting the game" scenario, against a local static server in a desktop browser; fix anything that fails until each scenario passes by manual check
- [ ] 7.2 Play the park for a few minutes — run the fence line, weave trees, jump, sit, bark — and verify a smooth frame rate with no console errors or visible hitches; if shadows were enabled, confirm they hold 60 fps-feel or dial them back per design

## Workflow follow-up

- Archive this change once its scenarios pass locally.
- Verify the archived result (`openspec validate` clean; `park-scene` and `dog-control` specs present under `openspec/specs/`).
- After the Epic branch merges, re-check the game at the deployed Pages URL (Milestone 1's outstanding deployed-URL check covers this).
