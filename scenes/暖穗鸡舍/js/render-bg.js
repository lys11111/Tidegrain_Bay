"use strict";

function drawBackground() {
  const w = Config.W, h = Config.H;
  ctx.fillStyle = "#5c3a21";
  ctx.fillRect(0, 0, w, 385);
  for (let y = 0; y < 385; y += 40) {
    ctx.fillStyle = (y / 40) % 2 === 0 ? "#644127" : "#55351e";
    ctx.fillRect(0, y, w, 38);
    ctx.fillStyle = "rgba(0,0,0,0.1)";
    ctx.fillRect(0, y+38, w, 2);
  }

  const sunX = w * 0.5 - normDeg(State.look.yaw) * 1.2;
  ctx.save();
  ctx.globalAlpha = 0.28;
  ctx.fillStyle = "#fff0b7";
  ctx.beginPath();
  ctx.moveTo(sunX - 36, 120);
  ctx.lineTo(sunX + 46, 120);
  ctx.lineTo(sunX + 180, h);
  ctx.lineTo(sunX - 160, h);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  drawWindow(180 - normDeg(State.look.yaw - 4) * 1.1, 106);
  drawWallProp(-110, "草捆");
  drawWallProp(118, "木桶");

  ctx.fillStyle = "#70462e";
  ctx.fillRect(0, 385, w, h - 385);
  for (let y = 398; y < h; y += 20) {
    ctx.strokeStyle = "rgba(180, 140, 60, .4)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y + Math.sin(y) * 12);
    ctx.stroke();
  }
}

function drawWindow(x, y) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = "#7b4a2b";
  roundRect(-46, -34, 92, 68, 8, true);
  ctx.fillStyle = "#ffe2a0";
  roundRect(-34, -24, 68, 48, 4, true);
  ctx.strokeStyle = "#9b6337";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(0, -24); ctx.lineTo(0, 24);
  ctx.moveTo(-34, 0); ctx.lineTo(34, 0);
  ctx.stroke();
  ctx.restore();
}

function drawWallProp(yaw, label) {
  const dx = normDeg(yaw - State.look.yaw);
  if (Math.abs(dx) > 90) return;
  const x = Config.W / 2 + dx * 2.0;
  ctx.save();
  ctx.globalAlpha = 0.45;
  ctx.fillStyle = label === "草捆" ? "#c39142" : "#6f3f27";
  roundRect(x - 26, 292, 52, 44, 10, true);
  ctx.restore();
}