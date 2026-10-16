# Proposal

## Why

Milestones 1–2 shipped a playable shell: static site, dog selection, a low-poly park and full third-person dog control. But the park is empty and frozen in fixed daylight — nothing else lives there. This change delivers Milestone 4 of the Epic (change `build-dog-park-game`, design D11 task group 4), the "living park": NPC dogs to meet, human visitors to react to the player's dog, and a continuous day/night cycle, so Super Action Doggo becomes a dog park life simulator.

## What Changes

- Add NPC dogs: several dogs built by the shared procedural dog builder (`js/dog-builder.js`) with parameter sets distinct from the two selectable presets, each wandering on its own — walk to a point, pause/sniff, repeat — through a small per-agent state machine, staying inside the park bounds (Epic design D3, D7).
- Add greet/sniff interaction with NPC dogs: coming within a short distance offers an on-screen prompt; performing it plays a short mutual interaction between the two dogs and raises the player dog's mood; a per-NPC cooldown stops repeat greetings from re-raising mood.
- Add human visitors: low-poly box-and-limb figures (Epic design D3) strolling waypoint paths along the park paths and pausing or sitting on park props (benches) without player input.
- Add visitor reactions to the player's dog: turning toward it when nearby, petting a calm dog that stays close (raising mood), and a startled step-back reaction when the dog barks nearby.
- Add a continuous day/night cycle: a time-of-day scalar looping over a few real minutes drives directional-light position/color/intensity, ambient/hemisphere light, sky and fog colors through interpolation tables, with smooth dawn/dusk transitions and dark-but-readable nights (Epic design D8).
- Wire mood gains for greeting and petting into the mood meter. The fetch-and-needs milestone owns the full mood/energy meters; if it has not landed when this change is implemented, this change ships a minimal HUD mood meter with the same clamped 0–100 model, which the needs milestone then absorbs.
- Update `dog-control`: the bark scenario now also expects nearby park visitors to react — completing the visitor-reaction clause the bark requirement deferred from Milestone 2.
- Update `park-scene`: its purpose no longer defers the day/night cycle, and it gains the continuous day/night requirement with its two scenarios.
- Update the README to describe the living park (NPC dogs, visitors, greet control, day/night).

## Capabilities

### New Capabilities

- `npc-dogs`: the non-player dogs that roam the park on their own — visibly dogs in the park's style yet distinguishable from the player's dog — and the greet/sniff interaction with prompt, mutual animation, mood gain and per-NPC cooldown.
- `park-visitors`: the human visitors strolling and lingering in the park, who notice, pet and get startled by the player's dog.

### Modified Capabilities

- `park-scene`: adds the "The park has a continuous day/night cycle" requirement (day→dusk→night→day loop, smooth transitions, repeatable, readable nights) and drops the purpose's "arrives with the living-park milestone" deferral.
- `dog-control`: the "The dog can bark" requirement's scenario gains the deferred clause that nearby park visitors react to the bark.

## Impact

- New ES modules under `js/` for the agent systems (NPC dog wandering, visitor strolling/reactions, shared agent plumbing) and the day/night lighting driver; `js/states/playing.js` wires them into the frame loop and owns the interaction prompt logic; `js/park-builder.js` may export bench/path anchor data for visitor waypoints and sitting.
- `index.html`/`css/style.css` gain the interaction prompt element and the mood meter (if the needs milestone has not landed first).
- `README.md` gains the greet control and living-park description.
- No new runtime dependencies: still only `three` from the pinned CDN import map; no build step, no physics engine, no audio (Phase 1 rules from the Epic's plan).

## Assumptions and open questions

- **Mood meter ownership:** the fetch-and-needs milestone (Milestone 3) is a sibling card that has not landed on this branch. Interactions route through one thin mood seam (`gainMood(amount, reason)`); if meters already exist they are used as-is, otherwise this change ships a minimal clamped 0–100 mood meter in the HUD and Milestone 3 absorbs it. Only mood is touched — no energy, drains or decay here.
- **Greet key binding:** `E` (edge-triggered, same pattern as sit/bark); `C`/`B`/`Space`/`Shift`/WASD are taken by dog control, `E` is free and reads as "interact". The Epic left bindings to milestones.
- **Agent counts:** several NPC dogs (≈3) and a handful of visitors (≈5), per the Epic's performance risk plan; exact counts are implementation tuning as long as the park visibly feels lived in.
- **Day/night length:** one full loop in roughly 4 real minutes (dusk observable within ~2 minutes of idling), tunable in the day/night module's constant table; daytime start after spawn.
- **Final integration loop includes fetch**, which is Milestone 3's. If Milestone 3 has not landed by then, the integration task verifies the living-park loop (select, explore, greet, be petted, bark at visitors, watch dusk) locally and the full fetch loop is re-run at the deployed Pages URL once both milestones are merged — the same deferred deployed-URL check pattern earlier milestones used.
- Verification stays manual (no test tooling by design); the deployed GitHub Pages URL check runs after the Epic branch merges.
