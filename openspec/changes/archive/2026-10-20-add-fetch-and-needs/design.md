# Design

## Context

Milestones 1, 2 and 4 are merged: the park, third-person dog control (`js/dog-controller.js`, `js/camera-rig.js`), NPC dogs, visitors and the day/night cycle all run inside `js/states/playing.js`'s frame loop. A minimal mood seam already exists — `js/mood.js` (clamped 0–100 with `gain(amount)`) feeding the bottom-left HUD mood meter, with greet/pet gains hard-coded at the call sites — and was explicitly meant to be absorbed by this milestone. Left mouse currently requests pointer lock on click and drives the drag-to-orbit fallback when unlocked (Epic design D5). The Epic's plan fixes the approach for this milestone in its D5 (throw gesture), D6 (bespoke ball physics, no physics engine), D8 (needs as frame-updated scalars with one tuning table) and D9 (DOM HUD). See the specs under `specs/` for the required behavior.

## Goals / Non-Goals

**Goals:**

- A fetch loop that composes with existing control: throw while moving/aiming, no new keys.
- Needs that make the meters matter: exhaustion caps the dog, mood rewards play.
- One place to tune every rate (Epic D8), including the greet/pet gains that already exist.
- No per-frame allocations in the ball path; one ball mesh reused across throws.

**Non-Goals:**

- No autonomous fetch AI — the player steers the chase and the return (Epic Phase 1).
- No ball interactions with NPC dogs or visitors, no catching a ball mid-air.
- No persistence of meter levels across restarts; `enter()` re-creates state like every other system.
- No new visual assets — the ball is a flat-shaded primitive (Epic D3).

## Decisions

### FD1: Ball as a small state machine in its own module
New `js/ball.js` owns the single ball mesh (flat-shaded sphere, `castShadow`) and its states: `flying → rolling → resting → carried`, plus `dropped-by-new-throw` removal. `update(dt)` integrates bespoke physics per Epic D6: constant gravity; on ground contact the vertical velocity reflects damped (restitution ≈ 0.45) while ground friction decays horizontal speed; below a rest threshold the ball settles to `resting`. The ball is kept inside the park by the shared clamp approach from `js/park-clamp.js` (boundary + prop colliders, with the outward velocity killed on contact so it slides rather than sticks). *Alternative:* a full physics engine — rejected by the Epic's non-goals for one dog and one ball.

### FD2: Charge-and-release throw with input disambiguation
Holding the left mouse button charges a throw (strength eases from minimum to maximum over ~1.2 s, shown by a small DOM charge bar near the screen center, Epic D9); releasing launches the ball from just above the dog's head along the camera aim derived from the rig's yaw/pitch, so aiming and throwing compose. Disambiguation against existing LMB roles (proposal assumption): while the pointer is locked, any hold charges; while unlocked, a hold charges only while the pointer stays roughly stationary — moving it turns the hold into an orbit drag and cancels charging; releases below a ~0.2 s minimum never throw, so the quick click that engages pointer lock cannot launch a stray ball. A new throw resets and reuses the one ball regardless of its current state (resting, rolling or carried), satisfying the one-ball rule. The throw origin (dog's x/z at release) is recorded for the return drop.

### FD3: Pick-up, carry and drop anchored to the head
When the dog comes within a short reach (~0.9 m) of a `resting` ball, the ball re-parents to the dog's head part (`dog.userData.parts.head`, already exported by the builder) at a fixed snout offset — the visible "in its mouth" carry. A quick head-dip overlay (same additive-overlay pattern `js/anim.js` uses for bark/sniff/greet) marks the grab and the drop. Dropping happens automatically when the carrying dog comes within the drop radius (~1.5 m) of the recorded throw origin: the ball re-enters the scene at the dog's feet as `resting`, ready for the next throw. *Alternative:* a separate "held item" bone/rig — rejected; Phase 1 has no rigs (Epic D4).

### FD4: Needs module absorbing the mood seam, one tuning table
`js/needs.js` replaces `js/mood.js`: `createNeeds()` returns clamped 0–100 `mood` and `energy` plus a per-frame `update(dt, activity)` that applies rates from the single exported `TUNING` table (Epic D8): `energyDrainRun` (per second), `energyCostJump` (per jump), `energyRecoverIdle`/`energyRecoverWalk` (per second), `energyLowThreshold`, `moodDecay` (per second, always-on — see proposal assumption), `moodGainFetch`, `moodGainGreet`, `moodGainPet`. The greet gain constant in `js/states/playing.js` and the pet gain inside `js/visitors.js` become reads from this table (visitors receive the needs object next to the existing `onMoodGain` seam, or the call site passes the table value — either way their observable behavior is unchanged). Jump drains its chunk when the jump actually fires; energy recovers whenever the dog is not running (standing, sitting and walking all recover, walking slower than idling). `mood.gain(amount, reason)` keeps a thin event entry point for fetch completion, greet and pet.

### FD5: Exhaustion gating with hysteresis in the controller
The needs object exposes `canRunJump()`: false once energy hits empty, true again only after energy recovers above `energyLowThreshold` (~15). `DogController.update` takes the verdict (injected from the playing state — the controller stays needs-agnostic): while gated, the run modifier is ignored (target speed caps at walking pace, so the existing gait blending shows the walk automatically) and the queued jump is consumed without firing. Hysteresis avoids the meter flickering between run/no-run at the boundary.

### FD6: HUD additions mirror the mood meter
`index.html`/`css/style.css` add an energy meter pill directly above the existing mood pill bottom-left (same track/fill styling, a cool color to contrast the mood gold) and the throw-charge bar (a thin centered element that fills while charging and hides otherwise). Meter updates reuse the playing state's percent-diff pattern so DOM writes happen only on change.

## Risks / Trade-offs

- [Hold-to-throw misfires during orbit drags when unlocked] → charge only starts on a stationary hold and cancels on drag; the lock hint copy teaches "hold left mouse to throw", nudging players into the locked mode where the gesture is unambiguous.
- [Ball tunnels through props or fence at high throw speed] → clamp per frame with the shared boundary/prop push-out and kill the outward velocity component; throw speed capped by the charge curve's maximum.
- [Tuning feels off (drain too fast/slow, decay invisible)] → every rate lives in one table; values are tuned during task verification against the `dog-needs` scenarios (directions and clamping are specified, magnitudes are not).
- [Charge bar/extra HUD clutters small viewports] → meters and bar are small fixed-position DOM elements over the canvas, consistent with the existing HUD style; no layout coupling.
- [Energy gating makes fetch briefly impossible at zero energy] → intended per spec (rest to recover); recovery while walking keeps the return trip productive.

## Migration Plan

Additive change to a static site: new modules and HUD elements ship together, `js/mood.js` is deleted with its two call sites rewired in the same commit. Restarting to the start screen already re-creates all playing state, so meters and ball reset without extra work. Rollback is reverting the commit; no data or API surface persists.

## Open Questions

- Exact charge-to-strength curve shape (linear vs eased) and the ball's visual size/color — implementation polish, decided while tuning the throw feel.
