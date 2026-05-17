"use strict";

function drawAuth() {
  ctx.fillStyle = "rgba(42, 28, 20, .97)";
  ctx.fillRect(0, 0, Config.W, Config.H);
  safeText("晨光小鸡舍", Config.W / 2, 80, 28, "#fcd264");
  safeText("TIDEGRAIN BAY", Config.W / 2, 115, 13, "#ae7b51");

  ctx.fillStyle = "rgba(255, 235, 190, .15)";
  roundRect(50, 150, 260, 46, 10, true);
  const uText = State.authUsername || "用户名 (至少2字)";
  safeText(uText, Config.W / 2, 173, 15, State.authUsername ? "#fff5d2" : "rgba(255,235,190,.4)");

  ctx.fillStyle = "rgba(255, 235, 190, .15)";
  roundRect(50, 210, 260, 46, 10, true);
  const pwText = (State.authPassword || "").replace(/./g, "●") || "密码 (至少4字)";
  safeText(pwText, Config.W / 2, 233, 15, State.authPassword ? "#fff5d2" : "rgba(255,235,190,.4)");

  if (State.authError) {
    ctx.fillStyle = "rgba(255, 100, 80, .15)";
    roundRect(50, 265, 260, 32, 8, true);
    safeText(State.authError, Config.W / 2, 281, 12, "#ff9a6c");
  }

  safeText("正在输入", Config.W / 2, 305, 11, "#ae7b51");
  safeText(State.authFocus === "username" ? "> 用户名 <" : "  用户名  ", Config.W / 2, 322, 11, "#fcd264");
  safeText(State.authFocus === "password" ? "> 密码 <" : "   密码   ", Config.W / 2, 338, 11, "#fcd264");

  if (State.authScreen === "login") {
    drawButton("登录", 86, 360, 188, 48, true);
    drawButton("注册新账号", 86, 420, 188, 40, false);
  } else {
    drawButton("注册", 86, 360, 188, 48, true);
    drawButton("已有账号？去登录", 86, 420, 188, 40, false);
  }

  safeText("输入后点击对应按钮即可", Config.W / 2, 490, 11, "#ae7b51");
  safeText("用户名: 点击用户名输入框", Config.W / 2, 510, 11, "#ae7b51");
  safeText("密码: 点击密码输入框", Config.W / 2, 528, 11, "#ae7b51");
}

function drawMenu() {
  ctx.fillStyle = "rgba(42, 28, 20, .96)";
  ctx.fillRect(0, 0, Config.W, Config.H);
  safeText("晨光小鸡舍", Config.W / 2, 110, 32, "#fcd264");
  safeText("TIDEGRAIN BAY", Config.W / 2, 145, 13, "#ae7b51");
  safeText(`最高评分: ${State.save.bestClear ? "S" : "-"}  完美天数: ${State.save.perfectDays}`, Config.W / 2, 180, 12, "#705641");
  safeText(`金币: ${State.save.coins}`, Config.W / 2, 200, 12, "#fcd264");
  if (State.save.currentUser) {
    safeText(`玩家: ${State.save.currentUser}`, Config.W / 2, 218, 11, "#ae7b51");
  }

  ctx.fillStyle = "rgba(255, 235, 190, .1)";
  roundRect(50, 240, 260, 70, 12, true);
  safeText("如何获得更好鸡蛋？", Config.W / 2, 262, 13, "#fcd264");
  safeText("喂食 · 抚摸 · 购买保温灯", Config.W / 2, 284, 11, "#c4a67a");
  safeText("好感度越高鸡蛋品质越好", Config.W / 2, 302, 11, "#ae7b51");

  drawButton("开始照料", 86, 330, 188, 48, true);
  drawButton("进入商店", 86, 393, 188, 48, false);
  drawButton("选择存档", 86, 456, 188, 40, false);
  drawButton("注销账号", 104, 510, 152, 40, false);
}

function drawCustomModeSelect() {
  ctx.fillStyle = "rgba(42, 28, 20, .96)";
  ctx.fillRect(0, 0, Config.W, Config.H);
  safeText("选择模式", Config.W / 2, 80, 28, "#fcd264");
  safeText("TIDEGRAIN BAY", Config.W / 2, 115, 13, "#ae7b51");

  ctx.fillStyle = "rgba(255, 235, 190, .1)";
  roundRect(50, 140, 260, 90, 12, true);
  safeText("正常模式", Config.W / 2, 165, 16, "#fcd264");
  safeText("3只小鸡 · 默认金币干草", Config.W / 2, 195, 12, "#c4a67a");

  ctx.fillStyle = "rgba(255, 235, 190, .1)";
  roundRect(50, 245, 260, 90, 12, true);
  safeText("自定义模式", Config.W / 2, 270, 16, "#fcd264");
  safeText("自由设定鸡数/金币/干草", Config.W / 2, 300, 12, "#c4a67a");

  const leftPressed = State.pressedButton === "customselect,10,150,155,75";
  const rightPressed = State.pressedButton === "customselect,195,150,155,75";
  ctx.fillStyle = leftPressed ? "#d4943e" : "#f0b45e";
  ctx.strokeStyle = "#ffe4a7";
  ctx.lineWidth = 2;
  if (leftPressed) {
    ctx.save();
    ctx.translate(87.5, 187.5);
    ctx.scale(0.94, 0.94);
    ctx.translate(-87.5, -187.5);
  }
  roundRect(10, 150, 155, 75, 12, true, true);
  if (leftPressed) ctx.restore();
  safeText("正常模式", 87.5, 193, 15, "#533420");

  if (rightPressed) {
    ctx.save();
    ctx.translate(272.5, 187.5);
    ctx.scale(0.94, 0.94);
    ctx.translate(-272.5, -187.5);
  }
  ctx.fillStyle = rightPressed ? "#d4943e" : "#f0b45e";
  ctx.strokeStyle = "#ffe4a7";
  ctx.lineWidth = 2;
  roundRect(195, 150, 155, 75, 12, true, true);
  if (rightPressed) ctx.restore();
  safeText("自定义", 272.5, 193, 15, "#533420");

  const backPressed = State.pressedButton === "customselect,104,545,152,40";
  ctx.fillStyle = backPressed ? "rgba(255,235,190,.38)" : "rgba(255,235,190,.18)";
  ctx.strokeStyle = "rgba(255,235,190,.46)";
  ctx.lineWidth = 2;
  if (backPressed) {
    ctx.save();
    ctx.translate(180, 565);
    ctx.scale(0.94, 0.94);
    ctx.translate(-180, -565);
  }
  roundRect(104, 545, 152, 40, 12, true, true);
  if (backPressed) ctx.restore();
  safeText("返回菜单", 180, 565, 14, "#5a3820");
}

function drawCustomSetup() {
  ctx.fillStyle = "rgba(42, 28, 20, .97)";
  ctx.fillRect(0, 0, Config.W, Config.H);
  safeText("自定义开局", Config.W / 2, 72, 26, "#fcd264");
  safeText(`玩家: ${State.save.currentUser}`, Config.W / 2, 105, 12, "#ae7b51");

  const cm = State.customMode;

  // 小鸡数量
  ctx.fillStyle = "rgba(255, 235, 190, .1)";
  roundRect(30, 115, 300, 55, 12, true);
  safeText("小鸡数量", Config.W / 2, 133, 14, "#fcd264");
  safeText(`${cm.chickens} 只`, Config.W / 2, 155, 18, "#fff5d2");
  const chLeft = State.pressedButton === "cmsetup,30,175,60,30";
  const chRight = State.pressedButton === "cmsetup,90,175,60,30";
  ctx.fillStyle = chLeft ? "#d4943e" : "#f0b45e";
  ctx.strokeStyle = "#ffe4a7"; ctx.lineWidth = 2;
  roundRect(30, 175, 60, 30, 10, true, true);
  ctx.fillStyle = chRight ? "#d4943e" : "#f0b45e";
  roundRect(90, 175, 60, 30, 10, true, true);
  safeText("-1", 60, 190, 16, "#533420");
  safeText("+1", 120, 190, 16, "#533420");
  if (cm.chickens < 9) {
    ctx.fillStyle = State.pressedButton === "cmsetup,155,175,60,30" ? "#d4943e" : "#f0b45e";
    roundRect(155, 175, 60, 30, 10, true, true);
    safeText("+1", 185, 190, 16, "#533420");
  }
  if (cm.chickens > 3) {
    ctx.fillStyle = State.pressedButton === "cmsetup,220,175,60,30" ? "#d4943e" : "#f0b45e";
    roundRect(220, 175, 60, 30, 10, true, true);
    safeText("-1", 250, 190, 16, "#533420");
  }

  // 初始金币
  ctx.fillStyle = "rgba(255, 235, 190, .1)";
  roundRect(30, 210, 300, 55, 12, true);
  safeText("初始金币", Config.W / 2, 228, 14, "#fcd264");
  safeText(`${cm.coins}`, Config.W / 2, 250, 18, "#fff5d2");
  const coinBtns = [
    { x: 30, label: "-50", tag: "cmsetup,30,255,60,30" },
    { x: 90, label: "-10", tag: "cmsetup,90,255,60,30" },
    { x: 150, label: "+10", tag: "cmsetup,150,255,60,30" },
    { x: 210, label: "+50", tag: "cmsetup,210,255,60,30" }
  ];
  for (const btn of coinBtns) {
    const pressed = State.pressedButton === btn.tag;
    ctx.fillStyle = pressed ? "#d4943e" : "#f0b45e";
    ctx.strokeStyle = "#ffe4a7"; ctx.lineWidth = 2;
    roundRect(btn.x, 255, 60, 30, 10, true, true);
    safeText(btn.label, btn.x + 30, 270, 15, "#533420");
  }

  // 初始干草
  ctx.fillStyle = "rgba(255, 235, 190, .1)";
  roundRect(30, 305, 300, 55, 12, true);
  safeText("初始干草", Config.W / 2, 323, 14, "#fcd264");
  safeText(`${cm.hay} 束`, Config.W / 2, 345, 18, "#fff5d2");
  const hayBtns = [
    { x: 30, label: "-50", tag: "cmsetup,30,335,60,30" },
    { x: 90, label: "-10", tag: "cmsetup,90,335,60,30" },
    { x: 150, label: "+10", tag: "cmsetup,150,335,60,30" },
    { x: 210, label: "+50", tag: "cmsetup,210,335,60,30" }
  ];
  for (const btn of hayBtns) {
    const pressed = State.pressedButton === btn.tag;
    ctx.fillStyle = pressed ? "#d4943e" : "#f0b45e";
    ctx.strokeStyle = "#ffe4a7"; ctx.lineWidth = 2;
    roundRect(btn.x, 335, 60, 30, 10, true, true);
    safeText(btn.label, btn.x + 30, 350, 15, "#533420");
  }

  const okPressed = State.pressedButton === "cmsetup,56,415,248,50";
  ctx.fillStyle = okPressed ? "#d4943e" : "#f0b45e";
  ctx.strokeStyle = "#ffe4a7"; ctx.lineWidth = 2;
  if (okPressed) {
    ctx.save();
    ctx.translate(180, 440);
    ctx.scale(0.94, 0.94);
    ctx.translate(-180, -440);
  }
  roundRect(56, 415, 248, 50, 12, true, true);
  if (okPressed) ctx.restore();
  safeText("创建存档", 180, 440, 18, "#533420");

  const cancelPressed = State.pressedButton === "cmsetup,104,485,152,40";
  ctx.fillStyle = cancelPressed ? "rgba(255,235,190,.38)" : "rgba(255,235,190,.18)";
  ctx.strokeStyle = "rgba(255,235,190,.46)"; ctx.lineWidth = 2;
  if (cancelPressed) {
    ctx.save();
    ctx.translate(180, 505);
    ctx.scale(0.94, 0.94);
    ctx.translate(-180, -505);
  }
  roundRect(104, 485, 152, 40, 12, true, true);
  if (cancelPressed) ctx.restore();
  safeText("返回", 180, 505, 14, "#5a3820");
}

function drawShop() {
  ctx.fillStyle = "rgba(42, 28, 20, .96)";
  ctx.fillRect(0, 0, Config.W, Config.H);
  safeText("小鸡商店", Config.W / 2, 65, 26, "#fcd264");
  safeText(`当前金币: ${State.save.coins}`, Config.W / 2, 95, 13, "#c47a20");

  ctx.fillStyle = "rgba(255, 235, 190, .12)";
  roundRect(30, 115, 300, 115, 12, true);
  safeText("鸡蛋兑换", Config.W / 2, 136, 14, "#fcd264");
  const q = State.save.eggQuality;
  safeText(`普通 ${q.normal||0} · 银 ${q.silver||0} · 金 ${q.gold||0} · 稀有 ${q.rare||0}`, Config.W / 2, 158, 11, "#7a5030");
  const totalVal = (q.normal||0)*10 + (q.silver||0)*20 + (q.gold||0)*50 + (q.rare||0)*100;
  safeText(`累计价值: ${totalVal} 金币`, Config.W / 2, 178, 11, "#7a5030");
  safeText("（鸡蛋在每日结算时自动卖出）", Config.W / 2, 198, 10, "#7a5030");

  ctx.fillStyle = "rgba(255, 235, 190, .08)";
  roundRect(30, 240, 300, 80, 12, true);
  safeText("商店功能", Config.W / 2, 258, 13, "#fcd264");
  safeText("干草 5金/1个 · 保温灯 500金", Config.W / 2, 278, 10, "#7a5030");
  safeText("小鸡: 黄200金 · 白400金 · 棕600金", Config.W / 2, 295, 10, "#7a5030");

  drawButton(`买干草 (+1) - 5金币`, 50, 330, 260, 50, false);
  safeText(`库存: ${State.save.hayStorage}`, Config.W / 2, 393, 11, "#7a5030");

  drawButton(State.save.heatLamp ? "已购买保温灯" : "买保温灯 - 500金币", 50, 408, 260, 50, false);
  safeText(State.save.heatLamp ? "已拥有 · 提升高品质蛋概率" : "提升高品质蛋概率", Config.W / 2, 471, 10, "#7a5030");

  drawButton("返回菜单", 104, 545, 152, 40, false);
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
  if ((Assets.loaded && State.screen === "boot") || performance.now() > 8000) {
    setTimeout(() => {
      State.screen = isLoggedIn() ? "slots" : "auth";
    }, 300);
    State.screen = "boot_done";
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
  drawButton("开启游戏", 86, 430, 188, 52, true);
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
  drawButton("居中并开始", 86, 480, 188, 52, true);
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
  const chickIds = Object.keys(State.save.ownedChickens);
  let friendStr = "";
  for (const id of chickIds) {
    const name = State.save.ownedChickens[id]?.name || id;
    friendStr += `${name}+${State.sessionFriendshipGain[id]||0} · `;
  }
  safeText(friendStr.slice(0, -3) || "无", 180, 275, 12, "#765238");
  safeText(`累计鸡蛋`, 180, 300, 12, "#9a6a3c");
  safeText(`普通 ${State.save.eggQuality.normal || 0} · 银 ${State.save.eggQuality.silver || 0} · 金 ${State.save.eggQuality.gold || 0} · 稀有 ${State.save.eggQuality.rare || 0}`, 180, 323, 12, "#765238");
  safeText(`已照料天数：${State.save.days} · 累计鸡蛋：${State.save.eggs}`, 180, 358, 12, "#9a6a3c");
  safeText("明天也来看看它们吧", 180, 400, 14, "#9a6a3c");
  drawButton("开始新的一天", 86, 440, 188, 48, true);
  drawButton("返回菜单", 104, 506, 152, 40);
}

function drawResult() {
  drawBackground();
  ctx.fillStyle = "rgba(47, 31, 23, .62)";
  ctx.fillRect(0, 0, Config.W, Config.H);
  ctx.fillStyle = "rgba(255, 239, 197, .94)";
  roundRect(32, 100, 296, 360, 18, true);
  safeText(State.resultTitle || "今日照料完成", 180, 148, 20, "#604026");
  safeText(State.resultBody || "", 180, 186, 12, "#765238");

  const chickIds = Object.keys(State.save.ownedChickens);
  let hStr = "", fStr = "";
  for (const id of chickIds) {
    const name = State.save.ownedChickens[id]?.name || id;
    hStr += `${name}:${State.save.chickenHunger?.[id]?"饿了":"吃饱"} · `;
    fStr += `${name}+${State.sessionFriendshipGain[id]||0} · `;
  }
  safeText(hStr.slice(0, -3) || "无小鸡", 180, 216, 11, "#9a6a3c");
  safeText(fStr.slice(0, -3) || "无", 180, 238, 11, "#765238");
  safeText(`累计：普通${State.save.eggQuality.normal||0} · 银${State.save.eggQuality.silver||0} · 金${State.save.eggQuality.gold||0} · 稀有${State.save.eggQuality.rare||0}`, 180, 262, 11, "#765238");
  safeText(`已照料天数：${State.save.days} · 累计鸡蛋：${State.save.eggs}`, 180, 286, 11, "#765238");
  safeText(`最佳完成：${formatBestClear()} · 完美日 ${State.save.perfectDays||0}`, 180, 310, 11, "#9a6a3c");
  safeText("明天也来看看它们吧", 180, 350, 13, "#9a6a3c");
  drawButton("再照料一次", 86, 385, 188, 48, true);
  drawButton("返回菜单", 104, 445, 152, 40);
}

function drawSlotSelect() {
  ctx.fillStyle = "rgba(42, 28, 20, .96)";
  ctx.fillRect(0, 0, Config.W, Config.H);
  safeText("选择存档", Config.W / 2, 80, 28, "#fcd264");
  safeText(`玩家: ${State.save.currentUser}`, Config.W / 2, 112, 13, "#ae7b51");

  const tierLabels = { yellow: "基础", white: "白银", brown: "黄金" };
  for (let i = 0; i < 3; i++) {
    const slot = State.slots[i];
    const y = 140 + i * 140;
    ctx.fillStyle = "rgba(255, 235, 190, .1)";
    roundRect(40, y, 280, 125, 12, true);
    safeText(`第 ${i + 1} 槽`, 180, y + 18, 14, "#fcd264");

    if (slot) {
      const chickCount = Object.keys(slot.ownedChickens || {}).length;
      safeText(`第 ${slot.days || 0} 天`, 180, y + 42, 13, "#fff5d2");
      safeText(`金币: ${slot.coins || 0}`, 180, y + 62, 12, "#fcd264");
      safeText(`鸡: ${chickCount} 只`, 180, y + 82, 12, "#c4a67a");
      const lastTier = slot.ownedChickens ? Object.values(slot.ownedChickens)[0]?.tier : "yellow";
      safeText(`等级: ${tierLabels[lastTier] || "基础"}`, 180, y + 102, 11, "#ae7b51");
      const isActive = State.currentSlot === i;
      drawButton(isActive ? "当前使用" : "选择此槽", 50, y + 112, 130, 34, isActive);
      drawButton("覆盖新建", 185, y + 112, 130, 34, false);
    } else {
      safeText("空存档", 180, y + 60, 14, "#ae7b51");
      drawButton("新建存档", 50, y + 112, 260, 34, true);
    }
  }

  drawButton("返回菜单", 104, 570, 152, 40, false);
}

function formatBestClear() {
  return State.save.bestClear ? `${State.save.bestClear}s` : "--";
}

function drawError(msg) {
  ctx.fillStyle = "#2f211b";
  ctx.fillRect(0, 0, Config.W, Config.H);
  safeText(msg || Config.errorText, 180, 310, 16, "#fff5d2");
}