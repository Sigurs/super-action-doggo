# Design

## Context

See proposal.md — Why. The FPS counter shipped with card sad-6 and was re-verified by card sad-7: `#fps-counter` sits inside `#playing-hud`'s `.hud-strip` in `index.html` (so the game's overlay switching hides it on the start screen), `css/style.css` styles it as a HUD pill right-aligned directly below the top strip, and `js/states/playing.js` refreshes it from a ~0.5 s `performance.now()` sampling window. The behavior is specified in `openspec/specs/fps-counter/spec.md` (three requirements, five scenarios). Nothing on `master` has touched the feature since the sad-7 verification passed. This change only re-verifies that shipped state; it changes no code, so the design below covers how the verification is run, not how the feature works.

The project is a no-build static site with no test tooling by design; verification is manual, in a browser (README "Run locally"). The environment provides a headless browser and the visual-check subagent for screenshots, which the previous verification used the same way (see `openspec/changes/archive/2026-10-17-verify-fps-counter/README.md`).

## Goals / Non-Goals

**Goals:**

- Produce trustworthy evidence, from the current code, that every scenario of the fps-counter spec still holds: visible top-right only while playing, absent on the start screen (also after Back to start), ~2 refreshes per second as a whole number close to the actual frame rate, and no overlap with any other HUD element at small and large window sizes.
- Leave the screenshots and visual-check verdicts under `.siggydev/visual-check/` (not committed) as the record, and summarize the verdict in this change's README.

**Non-Goals:**

- Fixing anything the check finds broken — a failure is reported on the card and planned as its own change.
- Re-verifying sad-6's code-level decisions (sampling source, placement below the strip) beyond what is observable on screen.
- Adding automated tests, toggles, or documentation.

## Decisions

- **Verify the working tree as-is, not a fresh build or the deployment.** The site is exactly what is committed (no build step), so serving the repository root with `python3 -m http.server` and opening it in the project's headless browser inspects the real shipped state. Alternative — the deployed GitHub Pages URL — was rejected because the card's check concerns this repository's code, and the local server is deterministic and offline.
- **Screenshots plus the visual-check subagent as the arbiter.** Capture the start screen and the playing screen (after clicking **Start**, waiting ~1 s for the first sampled value) at the default viewport, plus the playing screen at one small and one large viewport for the no-overlap scenario. The visual-check subagent reads the images and answers PASS/FAIL per item; the card explicitly asks for a visual confirmation, so DOM-level console assertions are only a supplement. Alternative — DOM assertions alone — was rejected as primary evidence for that reason.
- **Refresh cadence judged by observation over a few seconds, not instrumentation.** Watch or probe the counter's `textContent` (e.g. a MutationObserver over ~5 s) and count distinct refreshes; any plausible whole number satisfies the spec because the headless browser's absolute rate is meaningless. This matches how the spec's "Refresh cadence" scenario is phrased ("about twice per second").
- **Pass/fail only, then stop.** Each scenario check ends in PASS or FAIL recorded in tasks.md; on any FAIL, verification halts and the finding is written up rather than patched in passing. Same policy as the sad-7 verification.

## Risks / Trade-offs

- [Headless browser renders at a rate unrelated to a player's machine] → The cadence check verifies refresh *frequency* (~2 updates per second), not the absolute FPS value; any plausible whole number satisfies the spec.
- [Screenshots at only three viewports might miss an overlap at an odd size] → Mitigated by also reasoning from the CSS: the pill is absolutely positioned below the strip and right-aligned to its padding, so it cannot intersect the strip; the check re-runs if the reviewer doubts a specific size.
- [Visual-check subagent misreads a small pill] → The check asks it to transcribe the pill's text and location explicitly, so a vague "something is there" does not pass.
- [Re-check drift: sad-11's wording differs slightly from the spec] → The proposal maps the card's wording ("updates about twice a second", "never covers other HUD elements") onto the existing spec scenarios; if the reviewer reads the card differently, that mapping is the thing to correct.
