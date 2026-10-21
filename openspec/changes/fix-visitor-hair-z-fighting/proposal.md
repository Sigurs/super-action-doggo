# Proposal

## Why

Card sad-12 reports that the hair on the front of the NPC humans glitches/flickers. The five visitor figures in `js/visitors.js` are assembled from flat-shaded boxes, and the hair cap on each head is a box whose front face lands on exactly the same plane as the head cube's front face (the head is `0.2 × 0.24 × 0.21` at `z = 0`, the hair is `0.22 × 0.1 × 0.23` at `z = -0.01`, so both front faces sit at `z = 0.105`). Two coplanar surfaces of different materials produce z-fighting: the front strip of the hair shimmers and flickers as the visitor moves and the camera shifts, matching the card's screenshot. Every visitor shares the same geometry, so all five flicker.

## What Changes

- Fix the hair-to-head fit in `js/visitors.js` so the hair no longer shares a coplanar face with the head (and no other visitor part does either): the hair stays a cap on top of the head but its surfaces are separated from the head's by a small clearance, so no z-fighting/flicker appears from any camera angle.
- Keep everything else about the visitors as-is: the low-poly box-and-limb style, colors and hair colors per outfit, scales, head size, hair position wording, and all the visitor behavior (walking, sitting, noticing, petting, startle) and the rig the animator drives are unchanged.
- The fix is made in the shared `buildVisitor` assembly, so it applies uniformly to all five visitors and any future visitor — no per-outfit edits.
- Verify visually in the browser from multiple angles (including while walking, sitting and reacting) that the hair renders as a solid, stable cap with no shimmering.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `park-visitors`: adds a requirement that the human visitors render as stable solids with no coplanar-surface flicker (the hair fitted to the head without sharing a face), and a scenario that watching a visitor move shows no shimmering or flickering surfaces.

## Impact

- `js/visitors.js`: only the shared geometry/placement constants for the hair/head in `buildVisitor` change (a hair offset and/or hair depth, and possibly a shared clearance constant). No new meshes, materials or outfit entries; `createVisitors`, `updateVisitor`, `applyPose`, `onBark` and `reset` are untouched.
- No changes to `js/states/playing.js`, `js/states/start.js`, `js/park-builder.js`, HTML, CSS or any other module: they consume the same `visitors` group, the same `root`/pivot names and the same visitor-local coordinate frame.
- No new dependencies, build steps or APIs. Risk is contained to the visual assembly of one module and checked by browser screenshots.

## Assumptions and open questions

- **Cause is z-fighting, not animation:** the flicker comes from the hair box's front face being exactly coplanar with the head box's front face, not from per-frame jitter or depth-sorting code. The crawler is described as "glitching/flickering" on the front, which is the classic symptom of coincident surfaces. If the reviewer sees the glitch come from something else, the requirement (no flickering surfaces) still stands and implementation is re-diagnosed.
- **Hair stays a cap:** the intended look is a flat hair box sitting on top of and slightly overhanging the head; the fix is separation/placement, not a new hairstyle or extra geometry. Adding fringe, faces or textures is out of scope.
- **Applies to every visitor and every camera angle:** the same `GEOMETRIES.hair` and placement is shared by all five visitors, so one fix covers them; verification is done on several visitors, not just the one in the screenshot.
- **Small clearance is enough:** separating the two surfaces by a small fraction of a unit removes z-fighting at the park's viewing distances; the exact offset is implementation tuning settled by screenshots. The fix must not make the hair visibly float or detach from the head.
- **No spec for other visitor parts:** only the hair/head plane overlaps exactly today (legs, arms, torso and head sit at deliberately distinct positions), so the requirement is scoped to "no coplanar-surface flicker" generally but only the hair needs a change. If inspection finds another coincident pair, it is fixed under the same requirement.
- **Verification method:** manual browser screenshots reviewed with the visual-check subagent, as in earlier changes; the project has no automated tests by design.
