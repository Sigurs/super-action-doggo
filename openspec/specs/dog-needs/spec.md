# dog-needs Specification

## Purpose
The dog's mood and energy meters shown in the HUD: they rise and fall with activities and time, and low energy restrains the dog until it rests.

## Requirements

### Requirement: The HUD shows mood and energy
The HUD SHALL display a mood meter and an energy meter throughout gameplay, each showing a current level between empty and full.

#### Scenario: Checking the meters
- **WHEN** the player is in the park
- **THEN** both the mood and energy meters are visible and show the dog's current levels

### Requirement: Exertion drains energy
Running and jumping SHALL drain energy, and moving at walking pace or standing still SHALL let it recover over time.

#### Scenario: Tiring the dog out
- **WHEN** the dog runs or jumps repeatedly
- **THEN** the energy meter falls over time

#### Scenario: Recovering energy
- **WHEN** the dog stands still or walks for a while
- **THEN** the energy meter rises over time

### Requirement: Low energy prevents running
When energy is depleted, the dog SHALL be unable to run or jump until its energy has recovered past a low threshold.

#### Scenario: Exhausted dog
- **WHEN** the energy meter reaches empty
- **THEN** the dog slows to walking pace and cannot jump, no matter the inputs, until energy recovers above the low threshold

### Requirement: Enjoyable activities raise mood
Fetch play, greeting other dogs and being petted by visitors SHALL raise mood, while long stretches with nothing happening SHALL slowly lower it.

#### Scenario: Playing fetch
- **WHEN** the dog completes a fetch by returning the ball
- **THEN** the mood meter rises

#### Scenario: A boring stretch
- **WHEN** the dog does nothing but wander for a long period of game time
- **THEN** the mood meter slowly falls

### Requirement: Meters stay within bounds
Mood and energy SHALL never fall below empty nor rise above full; changes at the limits clamp there.

#### Scenario: Holding at full mood
- **WHEN** the dog keeps doing mood-raising activities while mood is already full
- **THEN** the mood meter stays at full and shows no overflow
