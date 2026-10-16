# Proposal

## Why

The game's frame rate is currently invisible: performance work (agent counts, shadows, day/night lighting) is judged only by feel. A small always-relevant FPS readout while playing gives the project and its players an objective, at-a-glance performance signal during this agentic-development test phase.

## What Changes

- Add a small frames-per-second counter to the playing HUD, in the top-right corner of the game screen — visible only while playing, never on the start screen.
- The counter refreshes about twice a second (a ~0.5 s sampling window), so it reports a stable average instead of flickering every frame.
- The counter reuses the existing HUD styling: the page's HUD font and the dark translucent pill look used by the lock hint and mood meter, so it reads as part of the HUD, not a debug overlay.
- It never covers other HUD elements: it sits clear of the top HUD strip (dog name and "Back to start" button), the greet prompt, the lock hint, the mood meter and bark bubbles at any window size.
- Verification is browser-based: serve the site, open it in the project's headless browser, screenshot the start screen and the playing screen, and have the visual check confirm the counter appears only while playing.

## Capabilities

### New Capabilities

- `fps-counter`: the on-screen frame-rate readout shown during play — sampled and refreshed about twice per second, styled with the existing HUD font and colours, confined to the top-right corner without covering other HUD elements, and present only in the playing state.

### Modified Capabilities

None. No existing capability's requirements change: dog-control, dog-selection, npc-dogs, park-scene, park-visitors and static-delivery are untouched by a display-only HUD addition.

## Impact

- `index.html`: one new element inside the existing `#playing-hud` section (so the game's overlay switching hides it on the start screen for free).
- `css/style.css`: styles for the counter pill plus its `hidden` rule, matching existing HUD patterns.
- `js/states/playing.js`: frame counting and the ~0.5 s DOM refresh, reset on `enter`.
- No new modules, dependencies, build steps or APIs; no changes to the game loop in `js/main.js`, the state machine in `js/game.js`, or any 3D scene content.

## Assumptions and open questions

- **Counter content:** plain whole-number FPS (for example `62 FPS`); no frame-time graph, no colour coding by rate.
- **"Twice a second":** a ~0.5 s sampling window (0.4–0.6 s acceptable), showing frames counted divided by wall-clock time in the window, rounded to a whole number.
- **Placement below the strip:** the very top-right corner is occupied by the "Back to start" button inside the HUD strip, so "top-right corner, never covering other HUD elements" is read as: right-aligned to the strip's padding, directly below the strip. If the reviewer instead wants it inside the strip between the dog name and the button, that is a one-line CSS/HTML tweak.
- **Sampling source:** the counter measures wall-clock time itself (a `performance.now()` delta per sampling window) rather than trusting the frame loop's `dt`, which `js/main.js` clamps to 0.1 s and would over-report FPS below ~10 fps.
- **Always on while playing:** no toggle, key or URL flag — the card asks for it plainly visible while playing.
- **README:** not updated for this small debug-flavoured HUD addition; the README describes player-facing features. The reviewer can request a line if they want it documented.
