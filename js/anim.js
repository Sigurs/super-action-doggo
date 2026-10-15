export function updateIdle(dog, elapsedTime, options = {}) {
  const parts = dog.userData.parts;
  const breatheSpeed = options.breatheSpeed ?? 2.4;
  parts.torso.position.y = parts.torso.userData.baseY
    + Math.sin(elapsedTime * breatheSpeed) * (options.bobAmount ?? 0.02);
  parts.tail.rotation.y = Math.sin(elapsedTime * (options.wagSpeed ?? 6))
    * (options.wagAmount ?? 0.55);
  parts.head.rotation.x = Math.sin(elapsedTime * breatheSpeed + 0.9) * 0.05;
}
