"use strict";

function drawButton(text, x, y, w, h, primary = false) {
  ctx.fillStyle = primary ? "#f0b45e" : "rgba(255, 235, 190, .18)";
  ctx.strokeStyle = primary ? "#ffe4a7" : "rgba(255, 235, 190, .46)";
  ctx.lineWidth = 2;
  roundRect(x, y, w, h, 12, true, true);
  safeText(text, x + w / 2, y + h / 2, primary ? 17 : 14, primary ? "#533420" : "#fff2ca");
}

function saveAndQuit() {
  saveGame();
  State.screen = "menu";
  State.paused = false;
  State.toast = "已保存";
  State.toastTimer = 1.5;
}

function drawHud() {
  ctx.fillStyle = "rgba(64, 39, 27, .72)";
  roundRect(10, 10, 340, 58, 12, true);
  safeText(`干草 ${State.feedPlaced}/3`, 28, 28, 13, "#fff5d2", "left");
  safeText(`摸摸 ${State.petsDone}/3`, 28, 51, 13, "#fff5d2", "left");
  safeText(`鸡蛋 ${State.eggsCollected}/2`, 138, 51, 13, "#fff5d2", "left");
  safeText(`${Math.ceil(State.timeLeft)}s`, 318, 29, 18, State.timeLeft <= 10 ? "#ffb6a1" : "#fff5d2");
  safeText(Config.version, 316, 53, 11, "#d8b982");
  drawFeedingPanel();
  if (State.holding === "hay") {
    ctx.fillStyle = "rgba(255, 232, 159, .92)";
    roundRect(250, 575, 92, 38, 12, true);
    safeText("手持干草", 296, 594, 13, "#6b4328");
  }
  const mode = State.sensorMode === "gyro" ? "陀螺仪+拖动" : "拖动";
  safeText(State.desktopSim ? "电脑测试" : mode, 181, 29, 12, "#ffe6a8");

  drawObjectiveGuide();

  drawButton("暂停", 16, 584, 64, 34);
  drawButton("结束", 90, 584, 64, 34);
}

function drawPauseMenu() {
  ctx.fillStyle = "rgba(47, 31, 23, .82)";
  ctx.fillRect(0, 0, Config.W, Config.H);
  ctx.fillStyle = "rgba(255, 239, 197, .96)";
  roundRect(56, 200, 248, 240, 18, true);
  safeText("游戏暂停", Config.W / 2, 250, 22, "#604026");
  safeText(`已进行 ${State.clearTime}s`, Config.W / 2, 285, 13, "#765238");
  safeText(`完成度 ${State.feedPlaced + State.petsDone + State.eggsCollected}/8`, Config.W / 2, 308, 13, "#765238");
  drawButton(86, 340, 188, 48, "继续游戏", true);
  drawButton(86, 400, 188, 48, "保存并退出", false);
  drawButton(104, 460, 152, 40, "返回菜单", false);
}

function drawFeedingPanel() {
  ctx.save();
  ctx.fillStyle = "rgba(64, 39, 27, .58)";
  roundRect(186, 74, 156, 31, 10, true);
  safeText(`料斗 ${State.hayLeft}`, 213, 89, 12, "#fff1c2");
  for (let i = 0; i < 3; i++) {
    const filled = i < State.feedPlaced;
    ctx.fillStyle = filled ? "#d8ad55" : "rgba(255, 235, 190, .22)";
    roundRect(254 + i * 24, 81, 17, 16, 5, true);
    if (filled) {
      ctx.fillStyle = "#fff0a7";
      ctx.fillRect(258 + i * 24, 86, 9, 3);
    }
  }
  ctx.restore();
}

function drawObjectiveGuide() {
  const next = getNextObjective();
  if (!next) return;
  const obj = next.obj;
  const delta = normDeg(obj.yaw - State.look.yaw);
  const offscreen = Math.abs(delta) > Config.fov / 2 - 8;
  const yDelta = obj.pitch - State.look.pitch;

  ctx.save();
  ctx.fillStyle = "rgba(64, 39, 27, .68)";
  roundRect(38, 112, 284, 30, 11, true);
  safeText(next.text, 180, 127, 12, "#fff1c2");

  if (offscreen) {
    const left = delta < 0;
    const x = left ? 28 : 332;
    const y = 320;
    ctx.fillStyle = "rgba(255, 232, 159, .92)";
    ctx.beginPath();
    if (left) {
      ctx.moveTo(x - 12, y);
      ctx.lineTo(x + 10, y - 16);
      ctx.lineTo(x + 10, y + 16);
    } else {
      ctx.moveTo(x + 12, y);
      ctx.lineTo(x - 10, y - 16);
      ctx.lineTo(x - 10, y + 16);
    }
    ctx.closePath();
    ctx.fill();
  } else if (Math.abs(yDelta) > 8) {
    const x = Config.W / 2 + (delta / (Config.fov / 2)) * (Config.W / 2);
    const y = yDelta > 0 ? 168 : 486;
    ctx.fillStyle = "rgba(255, 232, 159, .92)";
    ctx.beginPath();
    if (yDelta > 0) {
      ctx.moveTo(x, y - 13);
      ctx.lineTo(x - 13, y + 10);
      ctx.lineTo(x + 13, y + 10);
    } else {
      ctx.moveTo(x, y + 13);
      ctx.lineTo(x - 13, y - 10);
      ctx.lineTo(x + 13, y - 10);
    }
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

function drawParticles() {
  for (const p of State.particles) {
    const alpha = clamp(p.life / p.max, 0, 1);
    ctx.save();
    ctx.globalAlpha = alpha;
    if (p.type === "heart") {
      safeText("♥", p.x, p.y, p.size, "#ff6f9c");
    } else {
      ctx.fillStyle = "#fff3aa";
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
  for (const f of State.floaters) {
    ctx.save();
    ctx.globalAlpha = clamp(f.life / f.max, 0, 1);
    safeText(f.text, f.x, f.y, 14, f.color);
    ctx.restore();
  }
}

function drawToast() {
  if (State.toastTimer <= 0 || !State.toast) return;
  ctx.save();
  ctx.globalAlpha = clamp(State.toastTimer, 0, 1);
  ctx.fillStyle = "rgba(49, 32, 25, .78)";
  roundRect(38, 82, 284, 34, 12, true);
  safeText(State.toast, 180, 99, 13, "#fff5d2");
  ctx.restore();
}