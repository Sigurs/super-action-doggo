# Spec Delta

## Purpose

The non-player dogs that roam the park on their own and let the player's dog greet and sniff them, making the park feel lived in.

## ADDED Requirements

### Requirement: NPC dogs roam the park on their own
Several NPC dogs SHALL wander around the park independently, mixing walking, pauses and ground-sniffing, without player input and without leaving the park bounds.

#### Scenario: Watching the park
- **WHEN** the player observes the park over a stretch of game time
- **THEN** NPC dogs move around on their own, sometimes walking, sometimes pausing to sniff the ground, and never leave the park

### Requirement: NPC dogs are visibly dogs
NPC dogs SHALL be recognizable as low-poly dogs in the same style as the player's dog, and each SHALL be distinguishable from the dog the player is controlling.

#### Scenario: Telling dogs apart
- **WHEN** an NPC dog is near the player's dog
- **THEN** both read clearly as dogs, and the player can tell which one they control

### Requirement: Getting close offers a greeting
WHEN the player's dog comes within a short distance of an NPC dog, a greet/sniff interaction SHALL become available and be offered to the player.

#### Scenario: Approaching an NPC dog
- **WHEN** the player walks their dog up to an NPC dog
- **THEN** the game shows a prompt offering to greet or sniff that NPC dog

### Requirement: Greeting plays an interaction and lifts mood
Performing a greet/sniff SHALL play a short mutual interaction between the two dogs and SHALL raise the player dog's mood.

#### Scenario: Greeting a neighbor
- **WHEN** the player performs the greet action near an NPC dog
- **THEN** the two dogs play a brief greeting interaction and the mood meter rises

### Requirement: Repeated greetings need a pause
Greeting the same NPC dog again immediately SHALL NOT raise mood again; a short cooldown per NPC dog applies before a greeting counts anew.

#### Scenario: Greeting twice in a row
- **WHEN** the player greets the same NPC dog again within the cooldown
- **THEN** the interaction may still play, but the mood meter does not rise a second time
