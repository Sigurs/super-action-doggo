# Spec Delta

## Purpose

The shared low-poly dog model: one parameterized assembly that builds every dog in the game — the selectable player dogs, the start-screen previews and the NPC dogs — and governs how its parts fit together.

## ADDED Requirements

### Requirement: All dogs come from one shared model
Every dog rendered in the game — the selectable player dogs, their start-screen previews and the NPC dogs — SHALL be built from one shared low-poly dog model that varies only through its parameters (proportions, colors, ear and tail styles), never through per-dog copies of part construction.

#### Scenario: Comparing dogs in the park
- **WHEN** the player's dog stands near an NPC dog
- **THEN** both clearly read as dogs of the same style, differing in proportions and colors but not in how their bodies, heads or legs are put together

#### Scenario: A model fix reaches every dog
- **WHEN** a construction flaw in the shared model is corrected
- **THEN** the correction shows on the player dogs, the previews and every NPC dog without any per-dog edits

### Requirement: Legs end in clean white paws
Every leg of every dog SHALL end in a white paw that caps the foot like a sock: the paw SHALL fully contain the end of its leg so that no leg-colored geometry visibly crosses or pokes out of the paw from any viewing angle, and the paw SHALL be the part of the leg that reaches the ground.

#### Scenario: Inspecting a standing dog from any angle
- **WHEN** a dog stands still and the player views it from the front, the sides or the rear
- **THEN** each leg visibly ends in a white paw and no leg tip, seam or wedge breaks through the paw's surface

#### Scenario: Dogs of different builds
- **WHEN** a short-legged dog and a long-legged dog stand near each other in the park
- **THEN** both dogs' legs end in clean white paws, with no leg geometry poking through the white part on either build

#### Scenario: Watching a dog move
- **WHEN** a dog walks, runs, sits or jumps
- **THEN** its paws stay clean white socks throughout the motion, with the leg never appearing through the paw

#### Scenario: Turning a start-screen preview
- **WHEN** a dog preview rotates on the start screen
- **THEN** its legs end in clean white paws from every angle of the turn
