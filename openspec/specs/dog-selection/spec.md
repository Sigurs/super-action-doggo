# dog-selection Specification

## Purpose
The start screen that greets the player, shows the two dogs available in Phase 1, lets the player pick one, and starts the game with that dog. In this milestone the playing scene is a minimal placeholder; the full park arrives in a later milestone.

## Requirements

### Requirement: The game opens on a start screen
The game SHALL open on a start screen showing the game title and the available dogs, before any gameplay begins.

#### Scenario: Loading the game
- **WHEN** the game is loaded in a browser
- **THEN** a start screen is shown with the title "Super Action Doggo" and the two selectable dogs, and no dog is being controlled yet

### Requirement: Two selectable dogs
The start screen SHALL offer exactly two dogs that are both visibly cute and clearly distinguishable from each other by appearance.

#### Scenario: Comparing the offered dogs
- **WHEN** the player views the dog choices on the start screen
- **THEN** two dogs are shown and their looks differ enough to tell them apart at a glance

### Requirement: Dog previews are rotating 3D models
The start screen SHALL present each offered dog as a low-poly 3D model that rotates, so the player can see the dog from all sides before choosing.

#### Scenario: Watching a preview
- **WHEN** the player watches a dog preview on the start screen
- **THEN** the preview turns continuously, showing the dog from multiple angles over a few seconds

### Requirement: Selection is shown before starting
The start screen SHALL make clear which dog is currently selected and SHALL let the player change the selection before starting the game.

#### Scenario: Selection is highlighted
- **WHEN** the player views the start screen
- **THEN** exactly one dog is marked as the current selection by a visible highlight

#### Scenario: Switching dogs
- **WHEN** the player selects the other dog before starting
- **THEN** the start screen updates to show the newly selected dog as the current choice

### Requirement: The game starts with the chosen dog
The game SHALL leave the start screen and begin gameplay in the park with the dog chosen on the start screen under player control.

#### Scenario: Starting the game
- **WHEN** the player confirms the selection and starts the game
- **THEN** gameplay begins in the park with the chosen dog under player control, and no other dog appears

#### Scenario: Restarting returns to dog selection
- **WHEN** the player restarts from within the game
- **THEN** the game returns to the start screen, where the other dog can be chosen for the next round
