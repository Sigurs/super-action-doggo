# Tasks

Verification only — the FPS counter shipped with card sad-6 and nothing in this change may edit product code or specs. Scenario names refer to `openspec/specs/fps-counter/spec.md`. Serve the repository root (e.g. `python3 -m http.server 8000`), open the game in the project's headless browser, and save all screenshots under `.siggydev/visual-check/` (not committed). On any FAIL: stop, leave the task unchecked, and write the finding under a "Findings" heading at the bottom of this file instead of fixing anything.

## 1. Counter visible only while playing

- [x] 1.1 Capture a screenshot of the start screen (dog selection, before any run) and one of the playing screen (click **Start**, wait ~1 s for the first sampled value); run the visual-check subagent on both and record PASS when it confirms a legible whole-number `N FPS` pill sits in the top-right corner of the playing screen only, with no counter anywhere on the start screen ("Playing with the counter" + "No counter on the start screen" scenarios)
- [x] 1.2 While playing, click **Back to start**, screenshot, then start another run and screenshot again; record PASS when the visual check confirms the counter disappears with the HUD and returns on the next run (second half of "No counter on the start screen")

## 2. Refresh cadence and reading

- [x] 2.1 Observe the counter over ~5 s of play (optionally sampling its `textContent` from the page console and counting distinct values); record PASS when it refreshes about twice per second — not every frame — and shows a whole number plausibly close to the rate the game runs at ("Refresh cadence" scenario)

## 3. No overlap with other HUD elements

- [x] 3.1 Capture the playing screen at one small and one large viewport (in addition to 1.1's default) and have the visual check confirm the counter overlaps neither the HUD strip (dog name, Back to start) nor the greet prompt, lock hint, mood meter or bark bubble in any of the three captures ("Sharing the top-right corner" scenario)

## 4. Verdict

- [x] 4.1 Confirm every scenario of `openspec/specs/fps-counter/spec.md` has PASSED above with no console errors during play; note the verdict (duplicate of sad-6, already satisfied) in this change's README so the reviewer sees the card's outcome at a glance

## Workflow follow-up

- Archive the change after the review requirements are satisfied; archiving must leave `openspec/specs/fps-counter/spec.md` untouched (this change sets `skip_specs: true` and has nothing to sync).
- Verify the archived result (`openspec validate` clean; the fps-counter spec unchanged).
