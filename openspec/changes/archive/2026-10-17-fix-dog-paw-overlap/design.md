# Design

## Context

`buildLegs` in `js/dog-builder.js` (lines 154–187) assembles each leg inside a pivot group placed at the hip: `pivot.position.set(x, legHeight, z)` with `legHeight = legLength + bodyHeight * 0.35`, so pivot-local y = −legHeight is the dog's ground plane (dog-local y = 0). Two meshes hang off each pivot:

- the leg: `CylinderGeometry(legRadius, legRadius * 1.08, legHeight, 7)` centered at `(0, -legHeight/2, 0)`, so it spans pivot-local y ∈ [−legHeight, 0] with a bottom rim radius of 1.08·r;
- the paw: `SphereGeometry(legRadius * 1.35, 7, 5)` scaled `(1, 0.75, 1.15)` — half-extents (1.35r, 1.0125r, 1.5525r) — centered at `(0, −(legHeight − 0.6r), zSide * 0.3r)`.

The glitch (matches the card's screenshot): the cylinder runs the full legHeight, but the paw center sits only 0.6r above the cylinder's bottom end. Above its equator a sphere narrows, so near the paw's top the leg passes clean through the paw's surface, and near the bottom the paw's shrinking cross-section (about 0.97r in x at rim height, offset 0.3r in z) no longer contains the leg's 1.08r rim — the leg tip pokes out of the lower side of the white paw. Short-legged builds (Blueberry: legLength 0.3) read worst. `createDog`'s other parts, presets, exports and `disposeDog` are correct and stay untouched.

## Goals / Non-Goals

**Goals:**

- The leg ends inside the paw: no leg-colored geometry visibly crosses the white paw from any angle, per the `dog-model` spec delta.
- Stance and rig identical: pivot positions, dog-local ground contact, leg thickness profile, colors and the pivot names `js/anim.js` drives are unchanged, so no animation or controller retuning.
- One fix for every dog: expressed in units of `legRadius`/`legHeight` so it holds across all five presets (leg radius 0.075–0.095, leg length 0.3–0.54) without per-preset values.

**Non-Goals:**

- No new foot anatomy (toes, front/hind hoof differentiation) — repair, not redesign.
- No changes to other deliberate overlaps in the model (the belly panel sits slightly proud of the body by design).
- No renderer tricks, materials, or depth-sorting changes — this is geometric interpenetration, not z-fighting.

## Decisions

### Shorten the leg column so it ends at the paw's widest zone

Keep the paw exactly where it is and cut the cylinder's length to `legHeight − legRadius * 0.6`, keeping its top attached at the hip (pivot-local y = 0). The cylinder's bottom rim then lands at the paw's equator height, where the paw's cross-section is at its maximum (1.35r in x vs the rim's 1.08r — ~0.27r nominal clearance on every side; in z the paw covers −1.25r…1.85r around the 0.3r forward nudge vs the rim's ±1.08r). Below the rim there is only paw, so nothing needs containing under the equator; above it, the paw's top hemisphere stands in front of the leg and reads as the sock's cuff. Ground contact is unaffected: the paw (bottom at pivot-local −legHeight − 0.4125r, same as today) becomes the sole instead of sharing it with the leg tip.

*Alternative:* enlarge/lower the paw until it swallows the full-length leg — rejected: containing a 1.08r rim high up the sphere needs a paw radius of ~1.7r, a chunkier foot that changes the dogs' silhouette. *Alternative:* taper the leg to a point inside the paw — rejected: changes the leg's look for no need. *Alternative:* build a real sock mesh (cylinder + cap) — rejected as redesign; out of scope per the proposal's assumptions.

### Keep the pivot group as the single rigid leg

Leg and paw stay children of the same `leg-*` pivot, so walk/sit/jump rotations swing them as one rigid body and the containment cannot break during animation — the fix only has to hold in the pivot's local frame.

### Keep all proportions parameter-relative

The overlap amounts stay multiples of `legRadius` (0.6r shortening, existing 0.3r z-nudge, existing 1.35/0.75/1.15 paw factors), so all presets scale together. If the heptagonal low-poly facets dip far enough inside the ideal sphere to show a seam at the equator (facets cut the cross-section by up to ~10%), widen the paw factor from 1.35 to ~1.45 before touching anything else; that is the one tuning knob, decided by screenshot.

## Risks / Trade-offs

- [Faceted sphere shows a seam where the rim meets the paw] → nominal clearance is ~0.25r; the tuning knob is the paw radius factor (1.35 → up to ~1.45), checked visually at the largest leg radius (Biscuit, 0.095).
- [Shortened leg reads as a gap at the ankle from some angles] → the paw's top hemisphere still overlaps the leg's silhouette above the equator, preserving the socked look; verify on the turntable preview.
- [Presets at the range extremes behave differently] → all values are multiples of legRadius/legHeight; tasks verify the smallest (Basil 0.075/0.3) and largest (Biscuit 0.095/0.54) builds plus an NPC dog in motion.
- [Sitting pose exposes the junction] → leg and paw rotate rigidly together, so it cannot open up; a sitting screenshot is still part of verification.

## Migration Plan

One function changes (`buildLegs` in `js/dog-builder.js`): the cylinder's height and (if tuning requires) the paw's radius factor. Rolling back restores the two previous constants; no data, APIs, state or other modules are involved. Archiving creates `openspec/specs/dog-model/spec.md` from this change's delta.

## Open Questions

None that could change the approach — the only deferred tuning is the final numeric overlap (start at 0.6r) and whether the paw factor needs the 1.45 bump, both settled by screenshots during implementation.
