# Proposal

## Why

Card sad-7 asks again for the playing-screen FPS counter that card sad-6 already delivered: the counter exists (`index.html:42`, `css/style.css:187`, `js/states/playing.js` sampling window), its capability is already specified in `openspec/specs/fps-counter/spec.md`, and the archived change `2026-10-16-add-fps-counter` implemented and visually verified it. Rather than re-implement finished work, this change re-checks the shipped feature end to end in the browser — exactly the verification the card requests — and treats any gap it finds as the follow-up to file.

## What Changes

- No product code, styling, HTML, or spec changes: the FPS counter as shipped by sad-6 is expected to already satisfy every requirement of card sad-7.
- Re-run the card's browser check against the current `master`: serve the repository root, open the game in the project's headless browser, and capture screenshots of the start screen and of the playing screen under `.siggydev/visual-check/`.
- Have the visual-check subagent confirm on those screenshots that the counter (an `N FPS` HUD pill) is visible in the top-right corner only while playing and absent on the start screen, clear of all other HUD elements.
- Confirm the remaining fps-counter scenarios still hold by direct observation: the reading refreshes about twice a second as a whole number close to the visible frame rate, and the counter stays clear of the HUD strip, greet prompt, lock hint, mood meter and bark bubbles at small and large window sizes.
- Record the verification outcome in this change's tasks; if anything fails, stop and report the gap as a new finding (a fix would be planned separately, not smuggled into this change).

## Capabilities

### New Capabilities

None. The behavior in question is already owned by the existing `fps-counter` capability (`openspec/specs/fps-counter/spec.md`), whose requirements cover everything card sad-7 asks for; this change adds no new behavior.

### Modified Capabilities

None. No requirement of any existing capability changes: this is a verification-only pass, so the change sets `skip_specs: true`.

## Impact

- No source files change. The check touches only the working tree's served copy and writes screenshots under `.siggydev/visual-check/` (not committed).
- Risk is minimal: if verification passes, the change is a no-op record that sad-7 duplicates sad-6; if it fails, the failure output becomes the input for a follow-up change.

## Assumptions and open questions

- **sad-7 is a re-check, not a redo:** the "(reaper check)" tag plus the shipped implementation and spec are read as "confirm the FPS counter is really there and working," not "build it again." If the reviewer instead wants the counter rebuilt or restyled, this is the wrong change and they should request changes describing what should differ.
- **Expected result:** verification passes and this change archives as a pure verification record with `skip_specs: true`; archiving must not alter the existing `openspec/specs/fps-counter/spec.md`.
- **Verification evidence:** screenshots under `.siggydev/visual-check/` plus the visual-check subagent's PASS/FAIL are the record; no automated test suite exists (the project has no test tooling by design).
- **Scope of "twice a second" and "never covers":** taken from the existing fps-counter spec — a ~0.5 s sampling window with a whole-number reading, and no overlap with any HUD element at any window size.
