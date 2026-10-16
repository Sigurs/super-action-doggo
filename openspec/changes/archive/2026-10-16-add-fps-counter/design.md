# Design

## Context

The HUD is plain DOM over the canvas: `#overlay-root` holds one `overlay-section` per game state, and `js/game.js` toggles each section's `hidden` class on every state change — the playing HUD (`#playing-hud` in `index.html`) therefore appears exactly while the playing state is active. The top of the playing screen is a full-width strip (`.hud-strip`, `css/style.css`): dog name on the left, "Back to start" button on the right, dark translucent background. Other HUD anchors: greet prompt and lock hint bottom-center, mood meter bottom-left, bark bubble projected near the dog's head. The frame loop in `js/main.js` calls `game.update(dt)` once per rendered frame, with `dt` clamped to 0.1 s.

## Goals / Non-Goals

**Goals:**

- A whole-number FPS readout refreshed about twice per second, measured accurately even when the true rate drops below the loop's 10 fps clamp.
- Zero-cost state correctness: the counter's visibility falls out of the existing overlay-section switching, with no edits to `js/game.js` or `js/states/start.js`.
- Guaranteed clearance from every existing HUD element at any window size, tracked automatically rather than by a hardcoded offset.

**Non-Goals:**

- No toggle (key, URL flag or settings), no colour-coding by rate, no frame-time/percentile readout.
- No changes to the game loop, state machine, renderer or any 3D content.
- No README change (see proposal assumptions).

## Decisions

### Element lives inside `#playing-hud`
One new `<div id="fps-counter">` added to the `#playing-hud` section in `index.html`. State visibility comes free: the section is `display: none` on the start screen and shown while playing, which is exactly the required behaviour. The playing state binds it in `bindElements()` like every other HUD node.

*Alternative:* a global element toggled by lifecycle code — rejected: duplicates the switching `js/game.js` already does and risks drifting out of sync.

### Position: anchored under the HUD strip
The very top-right of the screen is occupied by the strip's "Back to start" button, so "top-right corner, never covering other HUD elements" is realised as: directly below the strip, right-aligned with the strip's content padding. Make `.hud-strip` `position: relative` and give the counter `position: absolute; top: calc(100% + 0.5rem); right: 1.4rem;`. The offset tracks the strip's real rendered height (any font size, zoom or window width) instead of a hardcoded pixel guess; the corner below the strip is empty — every other HUD element is bottom-anchored or projected mid-screen. The counter gets `pointer-events: none` (the overlay root's default) since it is not interactive.

*Alternative:* a hardcoded `top` in rem — rejected: breaks silently if the strip's height ever changes. *Alternative:* a third flex item inside the strip between name and button — rejected: that is the bar, not the corner, and it reflows existing layout.

### Styling: reuse the HUD pill vocabulary
`border-radius: 999px; background: rgba(38, 48, 59, 0.55); color: #fff;` with `font-size: 0.85rem; font-weight: 700; letter-spacing: 0.05em;` — the same dark translucent pill as the lock hint and mood meter, at the mood label's type size. No new colours, fonts or shadows; it reads as HUD chrome, not a debug stowaway.

### Sampling: per-frame counting on wall-clock time, inside the playing state
`PlayingState` keeps `fpsFrames`, `fpsWindowStart` (a `performance.now()` timestamp) and updates them in `update(dt)`: increment the count, and when `performance.now() - fpsWindowStart >= 0.5 s`, write `Math.round(fpsFrames / elapsedSeconds)` into the element and reset both. `update()` runs exactly once per rendered frame, so the count *is* the frame count. Wall-clock time is used deliberately: the loop's `dt` is clamped to 0.1 s in `js/main.js`, so accumulating `dt` would over-report FPS below ~10 fps. Counters reset in `enter()` so a restart never shows the previous run's tail; the label starts as `-- FPS` and gets its first real value within half a second.

*Alternative:* compute FPS in `js/main.js` and pass it down — rejected: edits the shared loop and state interfaces for a HUD-only concern. *Alternative:* a `requestAnimationFrame` self-sampler — rejected: duplicates the loop's cadence for no gain; `update()` already runs once per frame.

### Paint order
`#bark-bubble` sits after the sections in the DOM, so a transient bubble projected near a dog in the top-right paints above the counter — the counter never covers it. Nothing else ever occupies the below-strip corner.

## Risks / Trade-offs

- [Counter drifts onto the strip if its layout changes] → anchored to the strip's own box (`top: calc(100% + 0.5rem)`), so it follows any height change automatically; only a deliberate move of the strip itself needs a CSS glance.
- [Window resize moves HUD elements into the corner] → all other HUD anchors are bottom-based or projected; a resize keeps the below-strip right edge clear. Checked at a small and a large viewport in the tasks.
- [Sampling jitter makes the number wobble] → half-second windows over whole frames; ±1 fps wobble at 60 fps is acceptable and honest.
- [Twice-a-second DOM writes] → a single `textContent` set per window; layout cost is negligible next to the 3D frame.

## Migration Plan

Purely additive: one element in `index.html`, one CSS rule pair (plus `position: relative` on `.hud-strip`), and bind/reset/sampling lines in `js/states/playing.js`. Reverting deletes exactly those; no data, APIs or persistence to migrate. Archiving creates the new `fps-counter` capability spec from this change's delta, copied over its Purpose.

## Open Questions

None — the remaining unknowns (exact window length inside 0.4–0.6 s, `--` placeholder text) are cosmetic tuning that cannot change the specs, approach or tasks.
