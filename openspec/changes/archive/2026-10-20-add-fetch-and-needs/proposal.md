# Proposal

## Why

Milestones 1, 2 and 4 shipped a lively park — dog selection, third-person control, NPC dogs, visitors and a day/night cycle — but the dog still has nothing to do with its player: no game to play together and no needs to care for. This change delivers Milestone 3 of the Epic (change `build-dog-park-game`, design D11 task group 3), fetch play and dog needs, turning the park into an actual play loop: throw the ball with the mouse, watch the dog sprint, grab it and bring it back, and keep an eye on mood and energy while doing so.

## What Changes

- Add mouse-thrown fetch: holding the left mouse button charges a throw and releasing it launches a ball from near the dog along the camera's aim (Epic design D5); the ball flies in an arc, bounces with damping and rolls to a rest under bespoke gravity/ground logic (Epic design D6), staying inside the park bounds.
- Enforce one ball at a time: a new throw removes any earlier ball that is still in play, whether resting, rolling or carried.
- Add ball pick-up and carry: a dog that comes within reach of a resting ball picks it up and visibly carries it in its mouth (a head-anchored carry pose).
- Add ball return: the throw origin is recorded at throw time; when the carrying dog is guided back near it, the dog drops the ball, ready for another throw — the throw→fetch→return cycle can repeat indefinitely.
- Add the dog needs system (Epic design D8): mood and energy as 0–100 clamped scalars driven every frame from one tuning table of rates per activity. Energy drains while running or jumping and recovers while walking or standing still; at empty the dog can no longer run or jump until energy recovers past a low threshold. Mood rises on a completed fetch (the existing greet/pet gains from Milestone 4 keep working), and slowly decays when nothing happens. All gains and losses clamp at the bounds.
- Add the energy meter to the HUD next to the existing mood meter (Epic design D9: DOM overlay meters), plus a small throw-charge indicator.
- Absorb the minimal mood seam Milestone 4 shipped (`js/mood.js`, HUD mood meter) into the full needs module with the single tuning table; the greet and pet mood gains move into that table.
- Update the README: throw control in the controls table, meters and the fetch loop in the game description.

## Capabilities

### New Capabilities

- `fetch-play`: mouse-thrown ball fetch — charge-and-release throw with arc, bounce and roll, at most one ball in play, mouth pick-up and carry of a resting ball, and return-and-drop near the throw origin.
- `dog-needs`: the mood and energy meters in the HUD — exertion drains energy while rest recovers it, empty energy blocks run and jump until a low threshold is passed, enjoyable activities (fetch, greeting, petting) raise mood while idle stretches lower it, and both meters clamp at their bounds.

### Modified Capabilities

None — `dog-control` (camera, movement, jump), `npc-dogs` and `park-visitors` requirements are unchanged; the greet/pet mood gains they already implemented become entries in the shared tuning table without their observable behavior changing.

## Impact

- New ES module(s) under `js/` for the ball/fetch system (throw, physics, pick-up/carry/drop state machine) and the needs system (mood + energy scalars, tuning table, per-frame rates); `js/mood.js` is absorbed and removed.
- `js/dog-controller.js` consults the energy level so an exhausted dog is capped to walking pace and cannot jump (with hysteresis past the low threshold).
- `js/states/playing.js` wires throw input (alongside the existing pointer-lock and drag-orbit handling), the fetch state machine, per-frame needs updates and the mood-gain hooks (fetch completion, greet, pet) into the frame loop.
- `index.html`/`css/style.css` gain the energy meter and the throw-charge indicator next to the existing mood meter.
- `README.md` gains the throw control and the fetch/needs description.
- No new runtime dependencies: still only `three` from the pinned CDN import map; no physics engine, no build step, no audio (Phase 1 rules from the Epic's plan).

## Assumptions and open questions

- **Milestone order:** Milestones 1, 2 and 4 have landed; this change is the last gameplay milestone of the Epic, so it absorbs the minimal mood seam (`js/mood.js` with `gain(amount)` and the bottom-left HUD meter) rather than shipping beside it, as the living-park change anticipated.
- **Throw vs camera input:** left mouse button currently clicks into pointer lock and drives the drag-to-orbit fallback. Assumed disambiguation: while the pointer is locked, any hold charges a throw; while unlocked, a roughly stationary hold charges (a moving hold stays an orbit drag and cancels charging), and holds shorter than a small minimum never throw — so the quick click that engages pointer lock cannot launch a stray ball. The lock hint copy teaches "hold left mouse to throw".
- **Pick-up timing:** the ball is picked up only once it is at rest (or nearly stopped), matching the `fetch-play` spec's "resting ball"; a ball still bouncing or rolling fast is not grabbed in passing.
- **Return is player-driven:** the dog is player-controlled, so "returns the ball" means the player guides the carrying dog back near the recorded throw origin, where the dog drops the ball on its own. No autonomous fetch AI in Phase 1.
- **Throwing while carrying:** allowed — the carried ball is "in play", so a new throw removes it and the new ball flies from near the dog (the dog does not throw its own carried ball; the old one simply disappears per the one-ball rule).
- **Mood decay is always-on:** a small constant decay rate applied every frame satisfies "long stretches with nothing happening slowly lower it" — gains from fetch, greeting and petting outpace it, so a playing dog's mood still trends up.
- **Gains consolidated:** the greet gain constant in `js/states/playing.js` and the pet gain inside `js/visitors.js` move into the one tuning table (Epic design D8 names greeting and petting among the table's rates); their values stay as tuned unless balancing needs it.
- **Fetch mood gain lands on drop:** "completes a fetch" is read as the drop at the throw origin, the moment the throw→fetch→return cycle closes.
- **Tuning values** (drain/recovery rates, decay, thresholds, throw strength curve) are implementation tuning inside the single table; scenarios only require the directions and clamping to hold.
- **README's deployed-URL note:** like earlier milestones, final verification is manual against a local static server; the full Epic integration loop at the deployed Pages URL (with fetch now in it) is re-run when the Epic branch merges, as the living-park change's follow-up anticipated.
