import confetti from "canvas-confetti";

export function triggerCakeRain() {
  const scalar = 4.5;
  const cake = confetti.shapeFromText({ text: "🍰", scalar });
  const birthdayCake = confetti.shapeFromText({ text: "🎂", scalar });
  const cupcake = confetti.shapeFromText({ text: "🧁", scalar });
  const donut = confetti.shapeFromText({ text: "🍩", scalar });
  const cookie = confetti.shapeFromText({ text: "🍪", scalar });

  const shapes = [cake, birthdayCake, cupcake, donut, cookie];
  const duration = 3000; // 3 seconds
  const end = Date.now() + duration;

  const interval = setInterval(() => {
    if (Date.now() > end) {
      clearInterval(interval);
      return;
    }

    // Launch a burst from the top right corner pointing to the bottom left
    confetti({
      particleCount: 15,
      angle: 220, // diagonal down-left
      spread: 35,
      origin: { x: 1.05, y: -0.05 }, // slightly offscreen top-right
      shapes: shapes,
      scalar: scalar,
      startVelocity: 55,
      gravity: 0.8,
      ticks: 300,
    });
  }, 200);
}
