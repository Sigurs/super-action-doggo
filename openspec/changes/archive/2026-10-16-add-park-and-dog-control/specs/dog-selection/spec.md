# Spec Delta

## MODIFIED Requirements

### Requirement: The game starts with the chosen dog
The game SHALL leave the start screen and begin gameplay in the park with the dog chosen on the start screen under player control.

#### Scenario: Starting the game
- **WHEN** the player confirms the selection and starts the game
- **THEN** gameplay begins in the park with the chosen dog under player control, and no other dog appears

#### Scenario: Restarting returns to dog selection
- **WHEN** the player restarts from within the game
- **THEN** the game returns to the start screen, where the other dog can be chosen for the next round
