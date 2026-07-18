import confetti from "canvas-confetti";

export function triggerCakeRain() {
  const duration = 3000; // 3 seconds
  const end = Date.now() + duration;

  const interval = setInterval(() => {
    if (Date.now() > end) {
      clearInterval(interval);
      return;
    }

    // Burst from bottom-left pointing up-right
    confetti({
      particleCount: 35,
      angle: 60,
      spread: 70,
      origin: { x: 0, y: 0.8 },
      startVelocity: 55,
    });

    // Burst from bottom-right pointing up-left
    confetti({
      particleCount: 35,
      angle: 120,
      spread: 70,
      origin: { x: 1, y: 0.8 },
      startVelocity: 55,
    });
  }, 150);
}
