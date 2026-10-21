# Design

## Context

`buildVisitor` in `js/visitors.js` (lines 89–137) assembles each visitor from flat-shaded boxes inside a `torsoPivot` group. The relevant part is the head/hair pair:

- head: `BoxGeometry(0.2, 0.24, 0.21)` at local `(0, 0.68, 0)` — front face at `z = 0.105`;
- hair: `BoxGeometry(0.22, 0.1, 0.23)` at local `(0, 0.81, -0.01)` — front face at `z = -0.01 + 0.115 = 0.105`.

Both front faces are exactly coplanar. Two coincident surfaces with different materials have no consistent depth ordering, so the GPU picks either the skin or the hair per pixel and per frame: the front strip of the hair flickers as the camera and visitor move. The same `GEOMETRIES.hair` and placement are shared by all five visitors. See proposal.md — Why for the card.

No other visitor parts are coincident today: legs (`±0.095, HIP_Y`), arms (`±0.225, 0.46`), torso (`0.275`) and head (`0.68`) sit at distinct local positions, and the hair's other faces (top `0.86`, sides `±0.11`, back `-0.125`, bottom `0.76`) do not line up with any head face (head spans `y 0.56–0.80`, `x ±0.10`, `z ±0.105`).

## Goals / Non-Goals

**Goals:**

- Remove the coplanar head/hair faces so the hair renders as a stable solid cap, per the `park-visitors` spec delta.
- Keep the visitor's look and rig identical: box style, sizes/colors, hair color per outfit, facial/silhouette proportions, and the `root`/`torsoPivot`/`legPivots`/`armPivots` names and local frame the animator drives.
- One fix for all visitors: the shared `GEOMETRIES.hair` and placement, not per-outfit edits.

**Non-Goals:**

- No new hair geometry (fringe, faces, textures) or changes to the visitor's overall look — repair, not redesign.
- No renderer tricks: no polygon offset, `depthWrite` toggles, material reordering or `renderOrder` changes. The problem is coincident geometry, not depth precision.
- No changes to visitor behavior or the shared dog builder.

## Decisions

### Separate the hair from the head along z instead of leaving them flush

Push the hair back (and/or shorten its depth) so its front face sits behind the head's front face by a small clearance, while its top still caps the head and its sides still overhang slightly. Concretely: reduce the hair's z center offset and/or depth so no hair face is coplanar with a head face, choosing the smallest offset that removes the flicker without the hair visibly detaching or floating.

*Alternative:* raise/lower the hair so the overlap is in y — rejected: the hair already overlaps the head top in y and that is not the flickering face; moving it in y changes the silhouette. *Alternative:* enlarge the head or shrink the hair to make them non-overlapping — rejected: the hair is meant to overhang and read as a cap. *Alternative:* renderer-level fixes — rejected as above.

### Express the clearance as a named constant

Add one small constant (e.g. a hair/head surface clearance) used by the placement so the intent is explicit and a future part can reuse the same rule ("no coincident faces"), rather than a bare magic number. Its value is implementation tuning settled by screenshots.

### Keep the fix inside the shared geometry/placement

Because all visitors reuse `GEOMETRIES.hair` and the same `hair.position.set(...)`, one edit covers every visitor and any future one; no outfit table, animation or state code changes. If inspection while implementing reveals another coincident pair elsewhere in the figure, it is fixed by the same rule (separate the surfaces) under the same requirement.

## Risks / Trade-offs

- [Hair pushed too far back looks detached or lets skin show across the top] → use the smallest clearance that removes the flicker and check from front/side/top; the hair still overhangs the head sides (`±0.11` vs `±0.10`) so it keeps reading as a cap.
- [Small clearance lets z-fighting persist at far distances] → a fraction of a unit is far larger than the depth-buffer error at the park's viewing ranges; verify at a distance as well as up close.
- [Another coincident pair exists that the card's screenshot did not show] → task 1.3 inspects the whole figure for coplanar faces (legs, arms, torso, head, hair) and fixes any found under the same requirement.
- [Fix accidentally touches behavior or the rig] → tasks verify all five visitors still walk, sit, notice, pet and startle unchanged, and that only the hair/head constants changed.

## Migration Plan

One assembly change in `js/visitors.js` (`GEOMETRIES` hair entry and/or the `hair.position.set` line, plus an optional named clearance constant). Rolling back restores the previous two numbers; no data, APIs, state or other modules are involved. No spec file is created on archive — this change only adds a requirement to the existing `park-visitors` spec.

## Open Questions

None that could change the approach — the only deferred choice is the exact clearance value, settled by screenshots during implementation.
