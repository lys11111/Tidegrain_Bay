"use strict";

function resetObjects() {
  const chickIds = ["chickA", "chickB", "chickC"];
  const eggPositions = [
    { yaw: -120, pitch: -36 },
    { yaw: 20, pitch: -35 },
    { yaw: 140, pitch: -36 }
  ];
  let eggIdx = 0;
  const eggs = [];
  for (const id of chickIds) {
    if (!State.save.chickenHunger?.[id]) {
      const pos = eggPositions[eggIdx++];
      const q = getEggQualityForChicken(id);
      if (q) {
        eggs.push({ id: `egg_${id}`, type: "egg", label: q.label, action: "拾取", yaw: pos.yaw, pitch: pos.pitch, angle: 15, state: "onGround", quality: q, fromChicken: id });
      }
    }
  }
  State.objects = [
    { id: "hopper", type: "hopper", label: "干草料斗", action: "拿干草", yaw: 0, pitch: -4, angle: 13, state: "ready" },
    { id: "trough1", type: "trough", label: "食槽 1", action: "放干草", yaw: -30, pitch: -18, angle: 13, state: "empty" },
    { id: "trough2", type: "trough", label: "食槽 2", action: "放干草", yaw: 0, pitch: -18, angle: 13, state: "empty" },
    { id: "trough3", type: "trough", label: "食槽 3", action: "放干草", yaw: 30, pitch: -18, angle: 13, state: "empty" },
    { id: "chickA", type: "chicken", label: "米粒", action: "摸摸", yaw: -150, baseYaw: -150, pitch: -24, angle: 17, state: "idle", color: "#fff6d7", pet: false, bob: 0, wander: 0, animState: "idle", animFrame: 0, animTimer: 0, dirFrame: 0, hungry: !!State.save.chickenHunger?.chickA },
    { id: "chickB", type: "chicken", label: "栗栗", action: "摸摸", yaw: 40, baseYaw: 40, pitch: -22, angle: 17, state: "idle", color: "#c98242", pet: false, bob: 1.7, wander: 1.2, animState: "idle", animFrame: 0, animTimer: 0, dirFrame: 0, hungry: !!State.save.chickenHunger?.chickB },
    { id: "chickC", type: "chicken", label: "小葵", action: "摸摸", yaw: 160, baseYaw: 160, pitch: -25, angle: 17, state: "idle", color: "#ffd85e", pet: false, bob: 3.1, wander: 2.4, animState: "idle", animFrame: 0, animTimer: 0, dirFrame: 0, hungry: !!State.save.chickenHunger?.chickC },
    ...eggs
  ];
}

function startGame() {
  Audio.ensure();
  resetObjects();
  State.screen = "playing";
  State.holding = null;
  State.hayLeft = Config.tasks.hay;
  State.feedPlaced = 0;
  State.lastFedId = null;
  State.eggsCollected = 0;
  State.petsDone = 0;
  State.timeLeft = Config.gameSeconds;
  State.resultTitle = "";
  State.resultBody = "";
  State.resultGrade = "";
  State.clearTime = 0;
  State.collectedEggs = [];
  State.sessionFriendshipGain = {};
  State.milestones = {};
  State.sessionCoins = 0;
  State.ended = false;
  State.paused = false;
  State.toast = "转动手机，也可按住画面拖动视角";
  State.toastTimer = 2.2;
  State.particles.length = 0;
  State.floaters.length = 0;
}

function endGame(auto) {
  if (State.ended) return;
  State.ended = true;
  const completed = State.feedPlaced + State.petsDone + State.eggsCollected;
  const perfect = completed >= 8;
  State.clearTime = Math.max(0, Math.round(Config.gameSeconds - State.timeLeft));
  State.resultGrade = getResultGrade(completed, State.timeLeft);
  State.screen = "nextday";
  State.save.days += 1;
  State.save.eggs += State.eggsCollected;
  if (perfect) {
    State.save.perfectDays = (State.save.perfectDays || 0) + 1;
    if (!State.save.bestClear || State.clearTime < State.save.bestClear) State.save.bestClear = State.clearTime;
  }
  for (const egg of State.collectedEggs) {
    State.save.eggQuality[egg.key] = (State.save.eggQuality[egg.key] || 0) + 1;
  }
  for (const o of State.objects) {
    if (o.type === "chicken") {
      const wasHungry = State.save.chickenHunger?.[o.id];
      const isHungry = State.feedPlaced < Config.tasks.hay;
      State.save.chickenHunger[o.id] = isHungry;
      if (!isHungry && o.pet) {
        State.save.friendship[o.id] = clamp((State.save.friendship[o.id] || 0) + 5, 0, 1000);
        State.sessionFriendshipGain[o.id] = (State.sessionFriendshipGain[o.id] || 0) + 5;
      }
      if (wasHungry && !isHungry) State.sessionFriendshipGain[o.id] = (State.sessionFriendshipGain[o.id] || 0) + 5;
      let gain = 0;
      if (o.pet) gain += 15;
      if (State.feedPlaced >= Config.tasks.hay) gain += 8;
      if (completed >= 8) gain += 5;
      if (gain > 0 && !(State.feedPlaced >= Config.tasks.hay && !o.pet)) {
        State.save.friendship[o.id] = clamp((State.save.friendship[o.id] || 0) + gain, 0, 1000);
        State.sessionFriendshipGain[o.id] = (State.sessionFriendshipGain[o.id] || 0) + gain;
      }
    }
  }
  const priceMap = { normal: 10, silver: 20, gold: 50, rare: 100 };
  State.sessionCoins = 0;
  for (const egg of State.collectedEggs) {
    State.sessionCoins += priceMap[egg.key] || 10;
  }
  State.save.coins += State.sessionCoins;
  saveGame();
  if (perfect) {
    State.resultTitle = "今天的小鸡都吃饱啦";
    State.resultBody = `评分 ${State.resultGrade} · 用时 ${State.clearTime}s · 赚取 ${State.sessionCoins} 金币`;
    Audio.beep("win");
  } else if (auto) {
    State.resultTitle = "还有小鸡在等你";
    State.resultBody = `评分 ${State.resultGrade} · 完成度 ${completed}/8 · 赚取 ${State.sessionCoins} 金币`;
  } else {
    State.resultTitle = "今日照料暂停";
    State.resultBody = `评分 ${State.resultGrade} · 完成度 ${completed}/8 · 赚取 ${State.sessionCoins} 金币`;
  }
}

function getResultGrade(completed, timeLeft) {
  if (completed >= 8 && timeLeft >= 35) return "S";
  if (completed >= 8) return "A";
  if (completed >= 6) return "B";
  if (completed >= 3) return "C";
  return "D";
}

function formatEggSummary() {
  if (!State.collectedEggs.length) return "0/2";
  const counts = {};
  for (const egg of State.collectedEggs) counts[egg.label] = (counts[egg.label] || 0) + 1;
  return Object.entries(counts).map(([label, count]) => `${label}x${count}`).join("、");
}

function findObjectAtScreen(tx, ty) {
  let best = null;
  let bestDist = Infinity;
  const tapRadius = 36;
  for (const obj of State.objects) {
    if ((obj.type === "egg" && obj.state === "collected") || (obj.type === "trough" && obj.state === "filled")) continue;
    const p = project(obj);
    if (!p) continue;
    const dist = Math.hypot(p.x - tx, p.y - ty);
    if (dist < tapRadius && dist < bestDist) {
      best = obj;
      bestDist = dist;
    }
  }
  return best;
}

function interact(tx, ty) {
  if (State.screen !== "playing") return;
  const obj = findObjectAtScreen(tx, ty);
  if (!obj) {
    Audio.beep("miss");
    return;
  }
  if (obj.type === "hopper") {
    if (State.holding === "hay") {
      State.toast = "手里已经有干草了";
      State.toastTimer = 1;
      return;
    }
    if (State.save.hayStorage <= 0) {
      State.toast = "干草耗尽，请去商店购买";
      State.toastTimer = 1.5;
      return;
    }
    State.save.hayStorage -= 1;
    State.holding = "hay";
    addFloater("手持干草", tx, ty - 20, "#ffe9a8");
    Audio.beep("hay");
    vibrate(25);
  } else if (obj.type === "trough") {
    if (State.holding !== "hay") {
      State.toast = "先去料斗拿干草";
      State.toastTimer = 1.2;
      Audio.beep("miss");
      return;
    }
    obj.state = "filled";
    obj.filledAt = performance.now();
    State.holding = null;
    State.feedPlaced += 1;
    State.lastFedId = obj.id;
    State.toast = "干草放好啦";
    State.toastTimer = 1;
    Audio.beep("place");
    vibrate(35);
    nudgeChickenToEat();
    sparkle(tx, ty - 8);
    checkMilestones();
  } else if (obj.type === "chicken") {
    if (!obj.pet) {
      obj.pet = true;
      obj.state = "happy";
      obj.happyTimer = 4.5;
      State.petsDone += 1;
      checkMilestones();
      burstHearts(tx, ty - 36, obj.color);
      addFloater("+好感", tx, ty - 64, "#ff7aa8");
      Audio.beep("pet");
      vibrate([20, 20, 30]);
    } else {
      State.toast = `${obj.label} 已经被摸摸过啦`;
      State.toastTimer = 1.1;
      Audio.beep("hay");
    }
  } else if (obj.type === "egg") {
    obj.state = "collected";
    State.eggsCollected += 1;
    State.collectedEggs.push(obj.quality);
    checkMilestones();
    addFloater(`+1 ${obj.quality.label}`, tx, ty - 28, obj.quality.sparkle);
    sparkle(tx, ty);
    Audio.beep("egg");
    vibrate(25);
  }
  if (State.feedPlaced >= 3 && State.petsDone >= 3 && State.eggsCollected >= 2) {
    setTimeout(() => endGame(false), 550);
  }
}

function checkMilestones() {
  const marks = [
    ["fed", State.feedPlaced >= Config.tasks.hay, "三格食槽都放好啦"],
    ["pet", State.petsDone >= Config.tasks.pets, "三只小鸡都开心啦"],
    ["egg", State.eggsCollected >= Config.tasks.eggs, "今天的鸡蛋收齐啦"]
  ];
  for (const [key, done, text] of marks) {
    if (done && !State.milestones[key]) {
      State.milestones[key] = true;
      State.toast = text;
      State.toastTimer = 1.6;
      sparkle(Config.W / 2, 210);
      return;
    }
  }
}

function nudgeChickenToEat() {
  const hungry = State.objects
    .filter(o => o.type === "chicken" && o.state !== "happy")
    .sort((a, b) => Math.abs(normDeg(a.yaw - State.look.yaw)) - Math.abs(normDeg(b.yaw - State.look.yaw)));
  const chick = hungry[0];
  if (chick) {
    chick.state = "eat";
    chick.eatTimer = 3.8;
    State.toast = `${chick.label} 听见干草声，跑去吃饭啦`;
    State.toastTimer = 1.8;
  }
}

function getNextObjective() {
  if (State.holding !== "hay" && State.feedPlaced < Config.tasks.hay && State.hayLeft > 0) {
    const hopper = State.objects.find(o => o.type === "hopper");
    return hopper ? { obj: hopper, text: "先看向料斗，拿一束干草" } : null;
  }
  if (State.holding === "hay") {
    const trough = State.objects.find(o => o.type === "trough" && o.state === "empty");
    return trough ? { obj: trough, text: "看向空食槽，把干草放好" } : null;
  }
  const chicken = State.objects.find(o => o.type === "chicken" && !o.pet);
  if (chicken) return { obj: chicken, text: `找到 ${chicken.label}，轻轻摸摸它` };
  const egg = State.objects.find(o => o.type === "egg" && o.state !== "collected");
  if (egg) return { obj: egg, text: "地上还有鸡蛋可以拾取" };
  return null;
}

function newGame() {
  State.save.days = 0;
  State.save.eggs = 0;
  State.save.bestClear = 0;
  State.save.perfectDays = 0;
  State.save.friendship = {};
  State.save.eggQuality = { normal: 0, silver: 0, gold: 0, rare: 0 };
  State.save.coins = 0;
  State.save.hayStorage = 10;
  State.save.heatLamp = false;
  State.save.chickenHunger = {};
  saveGame();
}