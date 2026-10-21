# Spec Delta

## ADDED Requirements

### Requirement: Visitors render without flickering surfaces
Every human visitor figure SHALL render as stable, solid geometry: no two parts SHALL share a coplanar face, so that no part of a visitor shimmers, flickers or z-fights from any camera angle or while the visitor is moving. In particular the hair SHALL sit on the head without any of its faces lying on the same plane as a head face.

#### Scenario: Inspecting a visitor's head
- **WHEN** the player looks at a standing visitor from the front, the sides or above
- **THEN** the hair reads as one solid cap attached to the head, with no flickering or patchy surface where the hair meets the head

#### Scenario: Watching a visitor move
- **WHEN** a visitor walks, turns, sits or reacts while the player watches
- **THEN** no part of the visitor's head or hair shimmers or flickers as the camera and visitor move
