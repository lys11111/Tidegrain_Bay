"use strict";

function drawMenu() {
  ctx.fillStyle = "rgba(42, 28, 20, .96)";
  ctx.fillRect(0, 0, Config.W, Config.H);
  safeText("晨光小鸡舍", Config.W / 2, 110, 32, "#fcd264");
  safeText("TIDEGRAIN BAY", Config.W / 2, 145, 13, "#ae7b51");
  safeText(`最高评分: ${State.save.bestClear ? "S" : "-"}  完美天数: ${State.save.perfectDays}`, Config.W / 2, 180, 12, "#705641");
  safeText(`金币: ${State.save.coins}`, Config.W / 2, 200, 12, "#fcd264");

  ctx.fillStyle = "rgba(255, 235, 190, .1)";
  roundRect(50, 220, 260, 70, 12, true);
  safeText("如何获得更好鸡蛋？", Config.W / 2, 242, 13, "#fcd264");
  safeText("喂食 · 抚摸 · 购买保温灯", Config.W / 2, 264, 11, "#c4a67a");
  safeText("好感度越高鸡蛋品质越好", Config.W / 2, 282, 11, "#ae7b51");

  drawButton(86, 315, 188, 48, "开始照料", true);
  drawButton(86, 378, 188, 48, "进入商店", false);
  drawButton(86, 441, 188, 40, "重新开始", false);
  drawButton(104, 498, 152, 40, "电脑测试", false);
}

function drawShop() {
  ctx.fillStyle = "rgba(42, 28, 20, .96)";
  ctx.fillRect(0, 0, Config.W, Config.H);
  safeText("小鸡商店", Config.W / 2, 65, 26, "#fcd264");
  safeText(`当前金币: ${State.save.coins}`, Config.W / 2, 95, 13, "#ffe4a7");

  ctx.fillStyle = "rgba(255, 235, 190, .12)";
  roundRect(30, 115, 300, 115, 12, true);
  safeText("鸡蛋兑换", Config.W / 2, 136, 14, "#fcd264");
  const q = State.save.eggQuality;
  safeText(`普通 ${q.normal||0} · 银 ${q.silver||0} · 金 ${q.gold||0} · 稀有 ${q.rare||0}`, Config.W / 2, 158, 11, "#c4a67a");
  const totalVal = (q.normal||0)*10 + (q.silver||0)*20 + (q.gold||0)*50 + (q.rare||0)*100;
  safeText(`累计价值: ${totalVal} 金币`, Config.W / 2, 178, 11, "#c4a67a");
  safeText("（鸡蛋在每日结算时自动卖出）", Config.W / 2, 198, 10, "#ae7b51");

  ctx.fillStyle = "rgba(255, 235, 190, .08)";
  roundRect(30, 240, 300, 80, 12, true);
  safeText("商店功能", Config.W / 2, 258, 13, "#fcd264");
  safeText("干草 50金 · 保温灯 500金 · 新鸡 200金", Config.W / 2, 278, 10, "#c4a67a");
  safeText("（新功能开发中）", Config.W / 2, 295, 10, "#ae7b51");

  drawButton(50, 330, 260, 50, `买干草 (+10) - 50金币`, false);
  safeText(`库存: ${State.save.hayStorage}`, Config.W / 2, 393, 11, "#ae7b51");

  drawButton(50, 408, 260, 50, State.save.heatLamp ? "已购买保温灯" : "买保温灯 - 500金币", false);
  safeText(State.save.heatLamp ? "已拥有 · 提升高品质蛋概率" : "提升高品质蛋概率", Config.W / 2, 471, 10, "#ae7b51");

  drawButton(104, 545, 152, 40, "返回菜单", false);
}

function drawBoot() {
  ctx.fillStyle = "#2e241d";
  ctx.fillRect(0, 0, Config.W, Config.H);
  const pulse = 0.92 + Math.sin(performance.now() * 0.003) * 0.08;
  ctx.save();
  ctx.globalAlpha = pulse;
  safeText("晨光小鸡舍", Config.W / 2, 260, 32, "#fcd264");
  ctx.restore();
  safeText("TIDEGRAIN BAY", Config.W / 2, 300, 13, "#ae7b51");
  const dots = ".".repeat(Math.floor(performance.now() / 500) % 4);
  safeText(`加载中${dots}`, Config.W / 2, 380, 14, "#8a6042");
  if (Assets.loaded && State.screen === "boot") {
    setTimeout(() => { State.screen = "permission"; }, 400);
  }
}

function drawPermission() {
  ctx.fillStyle = "rgba(42, 28, 20, .97)";
  ctx.fillRect(0, 0, Config.W, Config.H);
  safeText("开启陀螺仪体验", Config.W / 2, 160, 28, "#fcd264");
  safeText("倾斜手机 360° 环顾鸡舍", Config.W / 2, 220, 15, "#fff5d2");
  ctx.fillStyle = "rgba(255, 235, 190, .12)";
  roundRect(40, 250, 280, 140, 14, true);
  safeText("将手机平放或手持舒适", Config.W / 2, 290, 13, "#c4a67a");
  safeText("倾斜手机查看四周", Config.W / 2, 320, 13, "#c4a67a");
  safeText("点击屏幕中央交互", Config.W / 2, 350, 13, "#c4a67a");
  safeText("也可以直接拖动屏幕", Config.W / 2, 380, 13, "#c4a67a");
  drawButton(86, 430, 188, 52, "开启游戏", true);
}

function drawCalibrate() {
  ctx.fillStyle = "rgba(42, 28, 20, .97)";
  ctx.fillRect(0, 0, Config.W, Config.H);
  safeText("校准视角", Config.W / 2, 150, 28, "#fcd264");
  safeText("将手机朝向平时玩游戏的姿势", Config.W / 2, 210, 14, "#fff5d2");
  safeText("然后点击「居中」锁定正前方", Config.W / 2, 240, 14, "#fff5d2");
  safeText("小鸡们在360°各处，记得转动寻找！", Config.W / 2, 270, 12, "#fcd264");
  const cx = Config.W / 2, cy = 370;
  ctx.save();
  ctx.translate(cx, cy);
  const tilt = Math.sin(performance.now() * 0.002) * 8;
  ctx.rotate(tilt * Math.PI / 180);
  ctx.fillStyle = "#5c3a21";
  roundRect(-40, -60, 80, 120, 12, true);
  ctx.fillStyle = "#3b2c23";
  roundRect(-32, -48, 64, 90, 8, true);
  ctx.fillStyle = "#f5d08f";
  ctx.fillRect(-26, -42, 52, 74);
  ctx.fillStyle = "#7b4a2b";
  ctx.strokeStyle = "#9b6337";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, -42); ctx.lineTo(0, 32);
  ctx.moveTo(-26, 0); ctx.lineTo(26, 0);
  ctx.stroke();
  ctx.restore();
  ctx.strokeStyle = "#fff1a2";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(cx - 16, cy - 20); ctx.lineTo(cx - 6, cy - 20);
  ctx.moveTo(cx + 6, cy - 20); ctx.lineTo(cx + 16, cy - 20);
  ctx.moveTo(cx, cy - 26); ctx.lineTo(cx, cy - 16);
  ctx.moveTo(cx, cy + 16); ctx.lineTo(cx, cy + 26);
  ctx.stroke();
  drawButton(86, 480, 188, 52, "居中并开始", true);
}

function drawNextDay() {
  drawBackground();
  ctx.fillStyle = "rgba(47, 31, 23, .65)";
  ctx.fillRect(0, 0, Config.W, Config.H);
  ctx.fillStyle = "rgba(255, 239, 197, .96)";
  roundRect(32, 88, 296, 380, 18, true);
  const dayNum = State.save.days;
  safeText(`第 ${dayNum} 天完成`, 180, 140, 26, "#604026");
  safeText(State.resultTitle || "今日照料完成", 180, 178, 18, "#765238");
  safeText(State.resultBody || "", 180, 212, 13, "#9a6a3c");
  ctx.fillStyle = "rgba(180, 140, 90, .25)";
  roundRect(50, 230, 260, 110, 12, true);
  safeText(`本局好感`, 180, 252, 12, "#9a6a3c");
  safeText(`米粒 +${State.sessionFriendshipGain.chickA || 0} · 栗栗 +${State.sessionFriendshipGain.chickB || 0} · 小葵 +${State.sessionFriendshipGain.chickC || 0}`, 180, 275, 12, "#765238");
  safeText(`累计鸡蛋`, 180, 300, 12, "#9a6a3c");
  safeText(`普通 ${State.save.eggQuality.normal || 0} · 银 ${State.save.eggQuality.silver || 0} · 金 ${State.save.eggQuality.gold || 0} · 稀有 ${State.save.eggQuality.rare || 0}`, 180, 323, 12, "#765238");
  safeText(`已照料天数：${State.save.days} · 累计鸡蛋：${State.save.eggs}`, 180, 358, 12, "#9a6a3c");
  safeText("明天也来看看它们吧", 180, 400, 14, "#9a6a3c");
  drawButton(86, 440, 188, 48, "开始新的一天", true);
  drawButton(104, 506, 152, 40, "返回菜单");
}

function drawResult() {
  drawBackground();
  ctx.fillStyle = "rgba(47, 31, 23, .62)";
  ctx.fillRect(0, 0, Config.W, Config.H);
  ctx.fillStyle = "rgba(255, 239, 197, .94)";
  roundRect(32, 100, 296, 360, 18, true);
  safeText(State.resultTitle || "今日照料完成", 180, 148, 20, "#604026");
  safeText(State.resultBody || "", 180, 186, 12, "#765238");

  const hA = State.save.chickenHunger?.chickA ? "饿了" : "吃饱";
  const hB = State.save.chickenHunger?.chickB ? "饿了" : "吃饱";
  const hC = State.save.chickenHunger?.chickC ? "饿了" : "吃饱";
  safeText(`米粒:${hA} · 栗栗:${hB} · 小葵:${hC}`, 180, 216, 11, "#9a6a3c");
  safeText(`本局好感：米粒+${State.sessionFriendshipGain.chickA||0} · 栗栗+${State.sessionFriendshipGain.chickB||0} · 小葵+${State.sessionFriendshipGain.chickC||0}`, 180, 238, 11, "#765238");
  safeText(`累计：普通${State.save.eggQuality.normal||0} · 银${State.save.eggQuality.silver||0} · 金${State.save.eggQuality.gold||0} · 稀有${State.save.eggQuality.rare||0}`, 180, 262, 11, "#765238");
  safeText(`已照料天数：${State.save.days} · 累计鸡蛋：${State.save.eggs}`, 180, 286, 11, "#765238");
  safeText(`最佳完成：${formatBestClear()} · 完美日 ${State.save.perfectDays||0}`, 180, 310, 11, "#9a6a3c");
  safeText("明天也来看看它们吧", 180, 350, 13, "#9a6a3c");
  drawButton("再照料一次", 86, 385, 188, 48, true);
  drawButton("返回菜单", 104, 445, 152, 40);
}

function formatBestClear() {
  return State.save.bestClear ? `${State.save.bestClear}s` : "--";
}

function drawError(msg) {
  ctx.fillStyle = "#2f211b";
  ctx.fillRect(0, 0, Config.W, Config.H);
  safeText(msg || Config.errorText, 180, 310, 16, "#fff5d2");
}