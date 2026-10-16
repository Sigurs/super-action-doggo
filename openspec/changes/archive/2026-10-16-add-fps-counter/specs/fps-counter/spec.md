# Spec Delta

## Purpose

An on-screen frame-rate readout that keeps the game's performance visible during play, without disturbing the rest of the HUD or appearing on the start screen.

## ADDED Requirements

### Requirement: The frame rate is visible while playing
While the game is in the playing state, a small frames-per-second counter SHALL be visible in the top-right corner of the game screen, styled with the existing HUD font and colours, and no counter SHALL be visible on the start screen.

#### Scenario: Playing with the counter
- **WHEN** a run is in progress (the playing state is active)
- **THEN** a small counter showing the current frame rate is visible in the top-right corner of the game screen, styled like the rest of the HUD

#### Scenario: No counter on the start screen
- **WHEN** the start screen is shown, before starting a run or after returning via Back to start
- **THEN** no frame-rate counter is visible

### Requirement: The counter updates about twice a second
The frame rate SHALL be measured over a sampling window of roughly half a second and displayed as a whole number of frames per second, so the reading refreshes about twice per second rather than flickering every frame.

#### Scenario: Refresh cadence
- **WHEN** the game runs at a steady frame rate for a few seconds
- **THEN** the displayed value refreshes about twice per second and shows a whole-number frames-per-second reading close to the rate the game is actually running at

### Requirement: The counter never covers other HUD elements
The counter SHALL stay clear of every other element of the playing HUD at any window size.

#### Scenario: Sharing the top-right corner
- **WHEN** the counter is visible while the top HUD strip (dog name and Back to start button) is on screen
- **THEN** the counter does not overlap the strip or any other HUD element (greet prompt, look-around hint, mood meter, bark bubble) at any window size
