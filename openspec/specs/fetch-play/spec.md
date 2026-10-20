# fetch-play Specification

## Purpose
Fetch play: the player throws a ball into the park with the mouse, and the dog chases it, picks it up and returns it so it can be thrown again.

## Requirements

### Requirement: The player throws a ball with the mouse
The player SHALL be able to throw a ball from the dog's position into the park using the mouse to aim, and the ball SHALL fly in an arc, bounce and roll before coming to rest.

#### Scenario: Throwing the ball
- **WHEN** the player uses the throw control while aiming with the mouse
- **THEN** a ball launches from near the dog in the aimed direction, arcs through the air, bounces and rolls until it stops somewhere in the park

### Requirement: Only one ball is in play at a time
The game SHALL keep at most one ball in play; starting a new throw removes any previous ball that has not been returned.

#### Scenario: Throwing again before fetching
- **WHEN** the player throws while an earlier ball is still somewhere in the park
- **THEN** the earlier ball disappears and only the new ball remains in play

### Requirement: The dog picks up a resting ball
The dog SHALL pick up the ball in its mouth when the player brings the dog within reach of a resting ball.

#### Scenario: Reaching the ball
- **WHEN** the player steers the dog up to the resting ball
- **THEN** the dog grabs the ball and visibly carries it in its mouth

### Requirement: The dog returns the ball for another throw
The dog SHALL carry the ball back toward the point it was thrown from and drop it there, so the player can throw it again.

#### Scenario: Returning the ball
- **WHEN** the dog is carrying the ball and the player guides it back near where the throw originated
- **THEN** the dog drops the ball, which becomes ready to be thrown again
