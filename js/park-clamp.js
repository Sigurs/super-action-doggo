const BOUNDARY_MARGIN = 0.6;

// Clamps a ground-plane position (any object with x/z numbers, mutated in
// place) inside the park fence and pushes it out of prop colliders. Shared by
// the player controller and the park's NPC dogs.
export function applyParkClamp(position, agentRadius, park) {
  const maxRadius = park.radius - BOUNDARY_MARGIN;
  const distance = Math.hypot(position.x, position.z);
  if (distance > maxRadius) {
    position.x = (position.x / distance) * maxRadius;
    position.z = (position.z / distance) * maxRadius;
  }

  for (const collider of park.colliders) {
    const dx = position.x - collider.x;
    const dz = position.z - collider.z;
    const minDistance = collider.radius + agentRadius;
    const squared = dx * dx + dz * dz;
    if (squared < minDistance * minDistance && squared > 1e-8) {
      const actual = Math.sqrt(squared);
      position.x = collider.x + (dx / actual) * minDistance;
      position.z = collider.z + (dz / actual) * minDistance;
    }
  }
}
