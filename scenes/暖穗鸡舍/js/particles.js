"use strict";

function burstHearts(x, y, color) {
  for (let i = 0; i < 10; i++) {
    State.particles.push({
      type: "heart",
      x, y,
      vx: (Math.random() - 0.5) * 55,
      vy: -40 - Math.random() * 45,
      life: 0.85 + Math.random() * 0.35,
      max: 1.2,
      size: 8 + Math.random() * 7
    });
  }
}

function sparkle(x, y) {
  for (let i = 0; i < 12; i++) {
    State.particles.push({
      type: "spark",
      x, y,
      vx: (Math.random() - 0.5) * 85,
      vy: (Math.random() - 0.7) * 80,
      life: 0.55,
      max: 0.55,
      size: 3 + Math.random() * 4
    });
  }
}

function addFloater(text, x, y, color) {
  State.floaters.push({ text, x, y, color, life: 1.1, max: 1.1 });
}