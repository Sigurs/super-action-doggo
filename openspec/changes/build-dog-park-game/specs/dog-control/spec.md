# Spec Delta

## Purpose

Keyboard and mouse control of the player dog: movement, running, jumping and expressive actions, plus the third-person camera that follows the dog.

## ADDED Requirements

### Requirement: The dog is seen through a third-person camera
The camera SHALL follow the player's dog from behind and above so the dog stays visible, and the mouse SHALL rotate the camera's view around the dog.

#### Scenario: Orbiting the camera
- **WHEN** the player moves the mouse during gameplay
- **THEN** the camera orbits around the dog while continuing to point at it

#### Scenario: Following a moving dog
- **WHEN** the dog moves around the park
- **THEN** the camera keeps following so the dog remains on screen

### Requirement: The dog moves with the keyboard
The keyboard SHALL move the dog relative to the camera's view direction, and releasing the movement keys SHALL bring the dog to a stop.

#### Scenario: Walking in a direction
- **WHEN** the player holds a movement key
- **THEN** the dog walks in the corresponding direction relative to where the camera looks, turning smoothly as the direction changes

#### Scenario: Stopping
- **WHEN** the player releases all movement keys
- **THEN** the dog stops and returns to an idle stance

### Requirement: The dog can run
A run input SHALL make the dog move noticeably faster while held, and the dog's gait SHALL visibly change between walking and running.

#### Scenario: Running across the park
- **WHEN** the player holds the run input together with a movement key
- **THEN** the dog crosses the ground faster than when walking, with a visibly faster gait

### Requirement: The dog can jump
A jump input SHALL make the dog leap, with the dog leaving the ground and landing back on it.

#### Scenario: Jumping
- **WHEN** the player presses the jump input while the dog is on the ground
- **THEN** the dog jumps into the air and lands, and cannot jump again until it has landed

### Requirement: The dog can sit
A sit input SHALL put the dog into a sitting pose, and the dog SHALL remain sitting until the player moves it.

#### Scenario: Sitting
- **WHEN** the player presses the sit input
- **THEN** the dog sits down and stays seated

#### Scenario: Standing back up
- **WHEN** the player presses a movement key while the dog is sitting
- **THEN** the dog stands up and moves

### Requirement: The dog can bark
A bark input SHALL make the dog perform a clearly visible bark, shown through its animation and an on-screen cue, since Phase 1 has no audio.

#### Scenario: Barking
- **WHEN** the player presses the bark input
- **THEN** the dog plays a bark animation with a visible cue, and any nearby park visitors react
