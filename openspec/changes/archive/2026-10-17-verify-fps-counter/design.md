# Design

## Context

See proposal.md — Why. The FPS counter shipped with card sad-6: `#fps-counter` sits inside `#playing-hud` in `index.html` (so the game's overlay switching hides it on the start screen), `css/style.css` styles it as a HUD pill below the top strip, and `js/states/playing.js` refreshes it from a ~0.5 s `performance.now()` sampling window. The behavior is specified in `openspec/specs/fps-counter/spec.md`. This change only re-verifies that shipped state; it changes no code, so the design below covers how the verification is run, not how the feature works.

The project is a no-build static site with no test tooling by design; verification is manual, in a browser (README "Run locally"). The planning environment provides a headless browser and the visual-check subagent for screenshots.

## Goals / Non-Goals

**Goals:**

- Produce trustworthy evidence, from the current `master`, that the fps-counter spec's observable behavior still holds: visible top-right only while playing, absent on the start screen, ~2 refreshes per second as a whole number, no overlap with other HUD elements at any window size.
- Leave the screenshots and visual-check verdicts under `.siggydev/visual-check/` as the record.

**Non-Goals:**

- Fixing anything the check finds broken — a failure is reported back on the card and planned as its own change.
- Re-verifying sad-6's code-level decisions (sampling source, placement below the strip) beyond what is observable on screen.
- Adding automated tests, toggles, or documentation.

## Decisions

- **Verify on the planning branch as-is, not a fresh build.** The site is exactly what is committed (no build step), so serving the repository root with `python3 -m http.server` and opening it in the project's headless browser inspects the real shipped state. Alternative — spinning up the deployed GitHub Pages URL — was rejected because the card's check concerns this repository's code, not the deployment, and the local server is deterministic and offline.
- **Screenshots plus the visual-check subagent as the arbiter.** The start screen and the playing screen (after clicking **Start**, waiting ~1 s for the first sampled value) are captured at the default viewport, plus the playing screen at one small and one large viewport for the no-overlap scenario. The visual-check subagent reads the images and answers PASS/FAIL per item; it is the available pair of eyes for "counter visible only while playing" and "covers nothing". Alternative — DOM-level assertions in the page console — was rejected as the primary evidence because the card explicitly asks for a visual confirmation, though a quick console probe of `#fps-counter` textContent over time may supplement the refresh-cadence check.
- **Refresh cadence judged by observation over a few seconds, not instrumentation.** Watch the counter's text change roughly twice per second in the playing state and show a whole number plausibly close to the headless browser's actual rate; a short console snippet sampling `textContent` may be used to count distinct values over ~5 s. This matches how the spec's "Refresh cadence" scenario is phrased ("about twice per second").
- **Pass/fail only, then stop.** Each scenario check ends in PASS or FAIL recorded in tasks.md; on any FAIL, verification halts and the finding is written up rather than patched in passing.

## Risks / Trade-offs

- [Headless browser renders at a rate unrelated to a player's machine] → The cadence check verifies refresh *frequency* (~2 updates per second), not the absolute FPS value; any plausible whole number satisfies the spec.
- [Screenshots at only three viewports might miss an overlap at an odd size] → Mitigated by also reasoning from the CSS: the pill is absolutely positioned below the strip and right-aligned within it, so it cannot intersect the strip; the check re-runs if the reviewer doubts a specific size.
- [Visual-check subagent misreads a small pill] → The check asks it to transcribe the pill's text and location explicitly, so a vague "something is there" does not pass.
