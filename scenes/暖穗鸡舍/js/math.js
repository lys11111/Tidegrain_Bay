"use strict";

function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

function normDeg(v) {
  return ((v + 180) % 360 + 360) % 360 - 180;
}

function angleDistance(a, b) { return Math.abs(normDeg(a - b)); }

function project(obj) {
  const dx = normDeg(obj.yaw - State.look.yaw);
  if (Math.abs(dx) > Config.fov / 2 + 20) return null;
  const x = Config.W / 2 + (dx / (Config.fov / 2)) * (Config.W / 2);
  const y = 330 - (obj.pitch - State.look.pitch) * Config.pitchScale;
  const scale = clamp(1 - Math.abs(dx) / 130, 0.55, 1.15);
  return { x, y, scale, dx };
}

function getPoint(e) {
  const r = canvas.getBoundingClientRect();
  const t = e.touches ? e.touches[0] : e;
  return {
    x: (t.clientX - r.left) * Config.W / r.width,
    y: (t.clientY - r.top) * Config.H / r.height
  };
}

function hit(x, y, bx, by, bw, bh) {
  return x >= bx && x <= bx + bw && y >= by && y <= by + bh;
}

function roundRect(x, y, w, h, r, fill, stroke) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
}

function safeText(text, x, y, size = 16, color = "#fff7df", align = "center") {
  ctx.save();
  ctx.fillStyle = color;
  ctx.font = `700 ${size}px system-ui, sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = "middle";
  ctx.fillText(text, x, y);
  ctx.restore();
}

function vibrate(pattern) {
  try { if (navigator.vibrate) navigator.vibrate(pattern); } catch (_) {}
}