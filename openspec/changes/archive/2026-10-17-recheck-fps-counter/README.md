# recheck-fps-counter

Reaper check (card sad-11): re-verify the playing-screen FPS counter in the browser; no product changes expected.

# Verdict

**PASS — re-check of sad-6's feature, already satisfied.** Card sad-11 asked again for the playing-screen FPS counter that sad-6 shipped (and sad-7 re-verified); every scenario of `openspec/specs/fps-counter/spec.md` still holds on the current code, with no product changes made or needed.

## Evidence (under `.siggydev/visual-check/`, not committed)

| Scenario | Result | Evidence |
| --- | --- | --- |
| Playing with the counter | PASS | `02-playing-default.png`, `04-playing-again.png` — legible whole-number `5 FPS` pill top-right just below the HUD strip, same rounded-pill shape, dark translucent background and white HUD font as the strip and other pills (visual-check transcription and pixel inspection) |
| No counter on the start screen | PASS | `01-start-default.png`, `03-back-to-start.png` — no counter anywhere before a run and after **Back to start** (DOM: `#playing-hud` hidden, `#fps-counter` not rendered); it returns on the next run (`04-playing-again.png`) |
| Refresh cadence | PASS | MutationObserver on `#fps-counter`: at 640x400 (~13.6 rAF FPS) 12 refreshes in 6.05 s = **1.98/s**, mean interval 520.6 ms = 0.5 s window + one frame; whole numbers 12–14 FPS vs measured 13.56 rAF FPS. At 1280x720 (~5 rAF FPS, software WebGL) 10 refreshes in 6.11 s = 1.64/s, mean interval 614.5 ms — the same 0.5 s window plus frame granularity at the low render rate, never per-frame |
| Sharing the top-right corner | PASS | `02-playing-default.png` (1280x720), `05-playing-small.png` (640x400), `06-playing-large.png` (1920x1080) — visual check confirms no overlap with the HUD strip (dog name, Back to start), lock hint, mood meter or bark bubble at any size; `08-playing-greet-default.png` shows the live greet prompt ("Press E to greet Basil", bottom-centre) clear of the pill; DOM rect probes at all three sizes measure 0 px² intersection with every HUD element, including the greet prompt (bottom-centre at every size: y=589/720 live, y=311/400, y=902/1080) |

Console during play: no errors and no page errors across all runs — only environmental warnings from headless software WebGL (fallback deprecation notice, GPU ReadPixels stall messages) and one THREE.js deprecation notice about `PCFSoftShadowMap`.

## Capture-method notes

- The `Woof!` bark bubble lives 0.55 s in real time, shorter than a full-page screenshot under software WebGL; `05`/`06`/`07` froze its pop animation at the fully-visible keyframe via the Web Animations API (`currentTime = 165 ms; pause()`). The bubble's on-screen position is exactly where the game placed it; independent DOM rect probes during live (unfrozen) pops agree: 0 px² overlap at all three sizes.
- The greet prompt needs gameplay proximity; besides the live capture at 1280x720 (`08`), its rect at 640x400 and 1920x1080 was measured by briefly removing its `hidden` class (geometry probe only, restored immediately).

## Out-of-scope observation

At 640x400 the "Click to look around" pill touches the right end of the Mood meter track (as also noted by the sad-7 verification; neither element involves the FPS counter). Possible future card.
