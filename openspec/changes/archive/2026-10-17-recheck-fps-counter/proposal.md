# Proposal

## Why

Card sad-11 asks again for the playing-screen FPS counter that card sad-6 delivered and card sad-7 already re-verified: the counter exists on the current `master` (`index.html` `#fps-counter` inside `#playing-hud`, `css/style.css` pill below the HUD strip, `js/states/playing.js` ~0.5 s sampling window), its behavior is owned by the existing `fps-counter` capability (`openspec/specs/fps-counter/spec.md`), and the archived changes `2026-10-16-add-fps-counter` and `2026-10-17-verify-fps-counter` implemented and visually confirmed it. Rather than rebuild finished work, this change re-runs the card's browser check end to end against the current code — exactly the verification the card requests — and treats any gap it finds as a follow-up to file.

## What Changes

- No product code, styling, HTML, or spec changes: the FPS counter as shipped by sad-6 is expected to already satisfy every requirement of card sad-11.
- Run the card's browser check: serve the repository root, open the game in the project's headless browser, and capture screenshots of the start screen and of the playing screen under `.siggydev/visual-check/` (not committed).
- Have the visual-check subagent confirm on those screenshots that the counter (an `N FPS` HUD pill) is visible in the top-right corner only while playing and absent from the start screen, styled with the existing HUD font and colours.
- Confirm the remaining fps-counter scenarios still hold by direct observation: the reading refreshes about twice a second as a whole number close to the visible frame rate, and the counter never covers the HUD strip, greet prompt, lock hint, mood meter or bark bubbles at small and large window sizes.
- Record the verification outcome in this change's tasks and README; if anything fails, stop and report the gap as a finding (a fix would be planned as its own change, not smuggled into this one).

## Capabilities

### New Capabilities

None. The behavior in question is already owned by the existing `fps-counter` capability (`openspec/specs/fps-counter/spec.md`), whose three requirements cover everything card sad-11 asks for; this change adds no new behavior.

### Modified Capabilities

None. No requirement of any existing capability changes: this is a verification-only pass, so the change sets `skip_specs: true`.

## Impact

- No source files change. The check serves the working tree as committed and writes screenshots under `.siggydev/visual-check/` (not committed).
- Risk is minimal: if verification passes, the change is a no-op record that sad-11 re-asks for already-shipped behavior; if it fails, the failure output becomes the input for a follow-up change.

## Assumptions and open questions

- **sad-11 is a re-check, not a redo:** the "(reaper check)" tag, plus the shipped implementation, spec, and the sad-7 verification record, are read as "confirm the FPS counter is really there and working," not "build it again." If the reviewer instead wants the counter rebuilt or restyled, this is the wrong change and they should request changes describing what should differ.
- **Expected result:** verification passes and this change archives as a pure verification record with `skip_specs: true`; archiving must not alter the existing `openspec/specs/fps-counter/spec.md`.
- **Verification evidence:** screenshots under `.siggydev/visual-check/` plus the visual-check subagent's PASS/FAIL are the record; no automated test suite exists (the project has no test tooling by design).
- **Scope of "twice a second" and "never covers":** taken from the existing fps-counter spec — a ~0.5 s sampling window with a whole-number reading, and no overlap with any HUD element at any window size.
