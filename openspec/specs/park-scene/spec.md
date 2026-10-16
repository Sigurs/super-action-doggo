# park-scene Specification

## Purpose
The low-poly 3D park world the game takes place in: its grounds, trees and park props, and the bounded play area that keeps the dog inside the park. The day/night lighting cycle arrives with the living-park milestone.

## Requirements

### Requirement: The game takes place in a low-poly park
The game world SHALL be a dog park rendered in a low-poly style, containing an accessible ground with grassy and path areas, trees, and recognizable park props.

#### Scenario: Looking around the park
- **WHEN** the player looks around the game world
- **THEN** the park shows grass, paths, trees and park props in a consistent low-poly style

### Requirement: The park has a bounded play area
The park SHALL have a defined boundary that keeps the player's dog inside the playable area at all times.

#### Scenario: Walking to the park edge
- **WHEN** the player steers the dog toward or past the park boundary
- **THEN** the dog is stopped at the edge and cannot leave the playable area

### Requirement: Park props are solid
Trees and other park props SHALL block the dog's movement, so the dog cannot walk through them.

#### Scenario: Walking into a tree
- **WHEN** the player steers the dog into a tree or another park prop
- **THEN** the dog is pushed out around the prop instead of passing through it
