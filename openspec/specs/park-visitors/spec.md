# park-visitors Specification

## Purpose
The human visitors strolling and lounging in the park, who notice, pet and react to the player's dog.

## Requirements

### Requirement: Visitors spend time in the park
Human visitors SHALL occupy the park, walking along its paths and pausing or sitting at places such as benches, without player input.

#### Scenario: Observing visitors
- **WHEN** the player observes the park over a stretch of game time
- **THEN** visitors stroll along paths and some sit or linger on park props

### Requirement: Visitors notice a nearby dog
WHEN the player's dog comes close to a visitor, the visitor SHALL visibly notice it, for example turning toward the dog.

#### Scenario: Walking up to a visitor
- **WHEN** the player brings the dog within a short distance of a visitor
- **THEN** the visitor visibly turns their attention to the dog

### Requirement: A calm dog near a visitor gets petted
WHEN the player's dog stays close to a visitor and is not rushing around, the visitor SHALL pet the dog, and being petted SHALL raise the dog's mood.

#### Scenario: Getting petted
- **WHEN** the dog stands or sits near a visitor for a moment
- **THEN** the visitor plays a petting interaction with the dog and the mood meter rises

### Requirement: Barking startles nearby visitors
WHEN the player's dog barks near visitors, those visitors SHALL react visibly with a startled response, such as stepping back.

#### Scenario: Barking at the bench
- **WHEN** the dog barks within a short distance of one or more visitors
- **THEN** those visitors play a startled reaction
