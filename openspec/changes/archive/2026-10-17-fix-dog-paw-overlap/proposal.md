# Proposal

## Why

Card sad-10 reports that the dogs' paws render glitchy: on every leg the white paw "sock" and the leg column interpenetrate — the leg runs straight through the paw and its tip pokes back out of it (see `.siggydev/attachments/5-sad-overlapping-paws.png`, confirmed by visual inspection: front leg tips exit the lower rear of the paw spheres, and on the short-legged dogs the paws sit swallowed mid-leg with only white wedges sticking out of the leg's sides). The model is built once in `js/dog-builder.js` and shared by the two player presets, the start-screen previews and all three NPC dogs, so every dog in the park shows the defect. It undermines the "visibly cute" promise the start screen and the cozy look lean on.

## What Changes

- Fix the foot assembly in `buildLegs` (`js/dog-builder.js`) so each leg ends in a clean white paw: the leg column stops inside the paw instead of running its full length through it, and the paw caps the foot the way a sock does, with no leg geometry visibly poking out of the white paw from any angle.
- Keep everything else about the dog's look and stance as-is: leg pivot height, ground contact, leg thickness, colors, flat shading, and the walk/sit/jump animation rig (the pivots the animator drives) are unchanged, so dogs neither sink nor float and no animation retuning is needed.
- The fix is made in the shared builder, so it applies uniformly to Mochi, Blueberry, the three NPC presets (Biscuit, Pepper, Basil) and the start-screen previews — no per-preset edits.
- Verify visually in the browser for at least one long-legged and one short-legged preset (plus an NPC dog), from multiple camera angles, that no leg tip or seam crosses the white paws.

## Capabilities

### New Capabilities

- `dog-model`: the shared parameterized low-poly dog model that `js/dog-builder.js` assembles for the player dog, the start-screen previews and the NPC dogs — how its parts fit together, starting with the requirement that each leg ends in a clean white paw sock. No existing capability owns the model's construction: `dog-selection` owns the start-screen flow, `dog-control` owns inputs and animation behavior, and `npc-dogs` owns the roaming behavior, so the shared model's geometry needs its own home that all three can keep relying on.

### Modified Capabilities

None. The requirements of `dog-selection` ("visibly cute", previews), `npc-dogs` ("visibly dogs") and `dog-control` are unchanged in wording — this change fixes how the shared model meets them and records that under the new `dog-model` capability.

## Impact

- `js/dog-builder.js`: only `buildLegs` changes — the leg cylinder's length/placement and the paw mesh's size/placement relative to the leg pivot. No new meshes, materials or parameters; no changes to `createDog`, presets, exports or `disposeDog`.
- No changes to `js/states/start.js`, `js/states/playing.js`, `js/npc-dogs.js`, `js/anim.js`, HTML, CSS or any other module: they consume the same pivot names and dog-local coordinate frame as before.
- No new dependencies, build steps or APIs. Risk is contained to the visual assembly of one module and checked by browser screenshots.

## Assumptions and open questions

- **Same silhouette intended:** the paw was always meant to be a white sock capping the end of the leg (belly-colored sphere at the foot, as on the snout); the bug is placement/sizing, not a request for new foot geometry. If the reviewer wants a different paw style (toes, separate front/back feet), that is a redesign, not this fix.
- **Stance stays put:** leg pivot height (`legLength + bodyHeight * 0.35`) and the dog-local ground plane stay exactly as they are, so park-clamping, sitting pose and ground contact do not shift; the paw may extend to roughly the same ground level the leg tip has today.
- **"No overlap" scope:** the requirement is that no leg geometry visibly crosses the paw surface — the meshes may still touch/join at the ankle seam, since hiding the junction inside the paw is the intended look. Other deliberate overlaps in the model (e.g. the belly panel sitting slightly proud of the body) are out of scope.
- **All dogs, one fix:** NPC presets keep their own `legRadius`/`legLength` values; the fix must hold across the full preset range (leg radius 0.075–0.095, leg length 0.3–0.54) without per-preset tweaks.
- **Verification method:** manual browser screenshots reviewed with the visual-check subagent, as in earlier changes; the project has no automated tests by design.
- **Open question:** whether the white paws should also appear on the start-screen preview turntable at a specific zoom (they will — same builder); no separate work is planned for it.
