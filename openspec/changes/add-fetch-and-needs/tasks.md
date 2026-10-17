# Tasks

Verification is manual — serve the site with any plain static file server and check in a desktop browser (no test tooling by design; see design.md non-goals). Each task names the check that makes it done. Scenario names refer to this change's specs under `specs/`.

## 1. Needs foundation

- [x] 1.1 Implement `js/needs.js` (`createNeeds()` with clamped 0–100 mood and energy, per-frame `update(dt, activity)`, `gain(amount, reason)`, `canRunJump()` with the empty→low-threshold hysteresis) exporting the single `TUNING` table from design FD4; delete `js/mood.js` and rewire `js/states/playing.js` and `js/visitors.js` greet/pet gains to read `moodGainGreet`/`moodGainPet` from it; verify the mood meter still rises on greeting and petting exactly as before and the game console shows no errors
- [x] 1.2 Add the energy meter pill above the mood meter in `index.html`/`css/style.css` (same track/fill pattern, cool color) and drive both from the playing state's percent-diff update; verify the dog-needs "Checking the meters" scenario — both meters visible during play, reading between empty and full

## 2. Energy drain, recovery and gating

- [x] 2.1 Apply the energy rates each frame in the needs update (drain while `run`, chunk per fired jump, recover idle/walk/sit) and pass the activity from the playing state; verify the dog-needs "Tiring the dog out" and "Recovering energy" scenarios — repeated running/jumping visibly empties the meter, standing or walking refills it
- [x] 2.2 Gate the controller per design FD5: `DogController.update` accepts the `canRunJump()` verdict; while gated the run modifier is ignored (walk-speed cap, walk gait shows) and queued jumps are consumed without firing, until energy recovers past `energyLowThreshold`; verify the dog-needs "Exhausted dog" scenario — at empty the dog walks and cannot jump no matter the inputs, then runs again after recovery
- [ ] 2.3 Failsafe check: with meters pinned at their limits (run mood-raising activities at full mood; drain energy to empty and keep holding inputs), verify the dog-needs "Holding at full mood" scenario and that neither meter ever displays past empty or full

## 3. Ball and throw

- [ ] 3.1 Implement `js/ball.js` per design FD1: the single flat-shaded ball mesh with the `flying → rolling → resting` state machine, gravity, damped bounce, ground friction, rest threshold, and boundary/prop clamping via the shared `js/park-clamp.js` approach with outward velocity killed on contact; verify a thrown ball always comes to rest inside the park, never inside a tree or through the fence
- [ ] 3.2 Implement the charge-and-release throw in the playing state per design FD2: hold left mouse to charge (strength easing over ~1.2 s, DOM charge bar near screen center), release to launch from above the dog's head along the camera aim, with the unlocked-drag cancellation and the ~0.2 s minimum-hold guard so the pointer-lock click never throws; verify the fetch-play "Throwing the ball" scenario — the ball launches in the aimed direction, arcs, bounces and rolls to a stop, in both locked and unlocked (stationary hold) modes
- [ ] 3.3 Enforce the one-ball rule from design FD2: every throw resets and reuses the single ball whatever its state (resting, rolling or carried) and records the throw origin for the return; verify the fetch-play "Throwing again before fetching" scenario — an earlier unfetched ball disappears when a new throw lands

## 4. Fetch cycle

- [ ] 4.1 Implement pick-up and carry per design FD3: a resting ball within ~0.9 m of the dog re-parents to the head/snout anchor with the grab head-dip overlay; verify the fetch-play "Reaching the ball" scenario — steering up to the resting ball makes the dog visibly carry it in its mouth (including while walking/running around)
- [ ] 4.2 Implement the return drop per design FD3: when the carrying dog comes within ~1.5 m of the recorded throw origin the ball drops at the dog's feet back into `resting`, with the drop head-dip; verify the fetch-play "Returning the ball" scenario — the dropped ball is immediately throwable, and a throw→fetch→return cycle can repeat indefinitely without page reload or console errors
- [ ] 4.3 Fire `mood.gain(TUNING.moodGainFetch, 'fetch')` when the ball drops at the throw origin, and apply the always-on `moodDecay` in the needs update; verify the dog-needs "Playing fetch" scenario (mood meter rises on each completed return) and "A boring stretch" scenario (idling/wandering for a long stretch slowly lowers the meter)

## 5. Documentation

- [ ] 5.1 Update `README.md`: add the throw control (hold left mouse to charge, release to throw) to the controls table, replace the "Fetch and friends arrive in later milestones" line with the fetch loop and mood/energy meters, and mention that an exhausted dog walks until it rests; verify the README matches the shipped behavior and the local-run instructions still work on a fresh clone

## 6. Milestone verification

- [ ] 6.1 Walk every scenario in this change's `specs/fetch-play/spec.md` and `specs/dog-needs/spec.md` against a local static server in a desktop browser, including a repeated throw→fetch→return cycle; fix anything that fails until each passes by manual check
- [ ] 6.2 Play the integration loop with the whole park — select dog, explore, run until exhausted and recover, fetch repeatedly, greet an NPC dog, be petted, bark at visitors, watch dusk fall — and verify a smooth frame rate with no console errors or visible hitches; if frame rate dips, tune per the design's notes (the ball adds one shadow caster at most)

## Workflow follow-up

- Once this change merges into the Epic branch and it deploys, re-run the full Epic integration loop at the deployed GitHub Pages URL (select dog, explore, fetch, greet, be petted, bark at visitors, watch dusk fall; smooth frame rate, no console errors) — the deferred deployed-URL check the earlier milestones anticipated.
- Archive this change once its scenarios pass (`fetch-play` and `dog-needs` become main specs), then verify the archived result (`openspec validate` clean).
