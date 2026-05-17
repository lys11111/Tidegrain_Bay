"use strict";

function drawButton(text, x, y, w, h, primary = false) {
  const key = `${x},${y},${w},${h}`;
  const pressed = State.pressedButton === key;
  ctx.fillStyle = pressed
    ? primary ? "#d4943e" : "rgba(255,235,190,.38)"
    : primary ? "#f0b45e" : "rgba(255, 235, 190, .18)";
  ctx.strokeStyle = primary ? "#ffe4a7" : "rgba(255, 235, 190, .46)";
  ctx.lineWidth = 2;
  if (pressed) {
    ctx.save();
    ctx.translate(x + w/2, y + h/2);
    ctx.scale(0.94, 0.94);
    ctx.translate(-(x + w/2), -(y + h/2));
  }
  roundRect(x, y, w, h, 12, true, true);
  if (pressed) ctx.restore();
  safeText(text, x + w / 2, y + h / 2, primary ? 17 : 14, primary ? "#533420" : "#5a3820");
}

function saveAndQuit() {
  saveGame();
  State.screen = "menu";
  State.paused = false;
  State.toast = "已保存";
  State.toastTimer = 1.5;
}

function drawHud() {
  const totalHay = State.objects.filter(o => o.type === "trough").length;
  const totalChickens = State.objects.filter(o => o.type === "chicken").length;
  const totalEggs = State.totalEggsAtStart;
  ctx.fillStyle = "rgba(64, 39, 27, .72)";
  roundRect(10, 10, 340, 58, 12, true);
  safeText(`干草 ${State.feedPlaced}/${totalHay}`, 28, 28, 13, "#fff5d2", "left");
  safeText(`摸摸 ${State.petsDone}/${totalChickens}`, 28, 51, 13, "#fff5d2", "left");
  safeText(`鸡蛋 ${State.eggsCollected}/${totalEggs}`, 138, 51, 13, "#fff5d2", "left");
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

  drawButton("暂停", 10, 584, 52, 34);
  drawButton("商店", 66, 584, 52, 34);
  drawButton("状态", 122, 584, 52, 34);
  drawButton("保存", 178, 584, 52, 34);
  drawButton("结束", 234, 584, 52, 34);
  drawButton("退出", 290, 584, 60, 34);
}

function drawPauseMenu() {
  ctx.fillStyle = "rgba(47, 31, 23, .82)";
  ctx.fillRect(0, 0, Config.W, Config.H);
  ctx.fillStyle = "rgba(255, 239, 197, .96)";
  roundRect(56, 200, 248, 240, 18, true);
  safeText("游戏暂停", Config.W / 2, 250, 22, "#604026");
  safeText(`已进行 ${State.clearTime}s`, Config.W / 2, 285, 13, "#765238");
  safeText(`完成度 ${State.feedPlaced + State.petsDone + State.eggsCollected}/8`, Config.W / 2, 308, 13, "#765238");
  drawButton("继续游戏", 86, 340, 188, 48, true);
  drawButton("保存并退出", 86, 400, 188, 48, false);
  drawButton("返回菜单", 104, 460, 152, 40, false);
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

function drawPlayingShopOverlay() {
  ctx.fillStyle = "rgba(42, 28, 20, .85)";
  ctx.fillRect(0, 0, Config.W, Config.H);
  ctx.fillStyle = "rgba(255, 239, 197, .97)";
  roundRect(32, 50, 296, 540, 18, true);

  safeText("小鸡商店", Config.W / 2, 80, 22, "#604026");
  safeText(`金币: ${State.save.coins}`, Config.W / 2, 108, 13, "#fcd264");

  ctx.fillStyle = "rgba(255, 235, 190, .12)";
  roundRect(40, 125, 280, 80, 12, true);
  safeText("干草 +1", Config.W / 2, 143, 14, "#765238");
  const canHay = State.save.coins >= 5;
  drawButton(canHay ? "购买 - 5金币" : "金币不足", 50, 158, 200, 38, false);
  safeText(`库存: ${State.save.hayStorage}`, Config.W / 2, 210, 11, "#ae7b51");

  ctx.fillStyle = "rgba(255, 235, 190, .08)";
  roundRect(40, 225, 280, 65, 12, true);
  safeText(State.save.heatLamp ? "已拥有保温灯" : "保温灯 - 500金币", Config.W / 2, 243, 13, "#765238");
  if (!State.save.heatLamp) {
    drawButton(State.save.coins >= 500 ? "购买" : "金币不足", 50, 256, 200, 32, false);
  }

  safeText("购买小鸡", Config.W / 2, 310, 16, "#604026");
  const tiers = [
    { key: "yellow", name: "黄色小鸡", price: 200, tierLabel: "基础" },
    { key: "white", name: "白色小鸡", price: 400, tierLabel: "白银" },
    { key: "brown", name: "棕色小鸡", price: 600, tierLabel: "黄金" }
  ];
  for (let i = 0; i < tiers.length; i++) {
    const t = tiers[i];
    ctx.fillStyle = "rgba(255, 235, 190, .08)";
    roundRect(40, 328 + i * 72, 280, 62, 12, true);

    ctx.fillStyle = CHICKEN_TIERS[t.key].color;
    ctx.beginPath();
    ctx.arc(68, 359 + i * 72, 18, 0, Math.PI * 2);
    ctx.fill();

    safeText(`${t.name} - ${t.price}金币`, Config.W / 2, 344 + i * 72, 13, "#765238");
    safeText(t.tierLabel, Config.W / 2, 362 + i * 72, 10, "#ae7b51");
    const canBuy = State.save.coins >= t.price;
    drawButton(canBuy ? "购买" : "不足", 200, 340 + i * 72, 100, 36, false);
  }

  drawButton("关闭", 104, 555, 152, 40, false);
}

function drawChickenStatusPanel() {
  ctx.fillStyle = "rgba(42, 28, 20, .78)";
  ctx.fillRect(0, 0, Config.W, Config.H);
  ctx.fillStyle = "rgba(255, 239, 197, .97)";
  roundRect(32, 60, 296, 520, 18, true);

  safeText("小鸡状态", Config.W / 2, 92, 20, "#604026");
  safeText("点击任意处关闭", Config.W / 2, 116, 11, "#ae7b51");

  const chickens = State.objects.filter(o => o.type === "chicken");
  const tierLabels = { yellow: "基础", white: "白银", brown: "黄金" };

  if (chickens.length === 0) {
    safeText("还没有小鸡，去商店买一只吧！", Config.W / 2, 280, 13, "#ae7b51");
    drawButton("关闭", 104, 540, 152, 40, false);
    return;
  }

  for (let i = 0; i < chickens.length; i++) {
    const c = chickens[i];
    const friend = getFriendship(c.id);
    const hearts = heartsFromFriendship(friend);
    const data = State.save.ownedChickens?.[c.id];
    const hungryDays = data?.consecutiveHungryDays || 0;
    const tier = c.tier || "yellow";

    ctx.fillStyle = "rgba(255, 235, 190, .15)";
    roundRect(42, 132 + i * 140, 276, 125, 12, true);

    ctx.fillStyle = c.color;
    ctx.beginPath();
    ctx.arc(76, 182 + i * 140, 22, 0, Math.PI * 2);
    ctx.fill();

    safeText(c.label, 110, 148 + i * 140, 15, "#604026");
    safeText(tierLabels[tier], 172, 148 + i * 140, 11, "#ae7b51");

    ctx.fillStyle = "rgba(255, 235, 190, .25)";
    roundRect(50, 168 + i * 140, 180, 14, 6, true);
    const hungerPercent = hungryDays === 0 ? 100 : Math.max(0, (3 - hungryDays) / 3 * 100);
    ctx.fillStyle = hungryDays >= 2 ? "#ff6f6f" : hungryDays === 1 ? "#ffb06f" : "#6fcf6f";
    roundRect(50, 168 + i * 140, 180 * (hungerPercent / 100), 14, 6, true);
    safeText(`饱腹 ${Math.round(hungerPercent)}%`, 192, 175 + i * 140, 10, "#fff1c2");

    let heartStr = "";
    for (let h = 0; h < 5; h++) heartStr += h < hearts ? "♥" : "♡";
    safeText(heartStr, 76, 218 + i * 140, 16, "#ff7aa8");

    if (hungryDays >= 2) {
      ctx.fillStyle = "rgba(255, 80, 80, .2)";
      roundRect(150, 200 + i * 140, 160, 28, 8, true);
      safeText(`⚠ 连续饿了${hungryDays}天！`, 230, 214 + i * 140, 12, "#ff5050");
    } else if (hungryDays === 1) {
      ctx.fillStyle = "rgba(255, 180, 60, .2)";
      roundRect(150, 200 + i * 140, 160, 28, 8, true);
      safeText(`饿了1天，注意喂食`, 230, 214 + i * 140, 11, "#ffb03c");
    }
  }

  drawButton("关闭", 104, 540, 152, 40, false);
}