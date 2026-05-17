"use strict";

const CHICKEN_TIERS = {
  yellow: { name: "小黄", color: "#ffd85e", price: 200, tierKey: "yellow" },
  white:  { name: "银羽", color: "#fff6d7", price: 400, tierKey: "white" },
  brown:  { name: "金栗", color: "#c98242", price: 600, tierKey: "brown" }
};

function resetObjects() {
  const hopper = { id: "hopper", type: "hopper", label: "干草料斗", action: "拿干草", yaw: 0, pitch: -58, angle: 13, state: "ready" };

  const chickens = [];
  const troughs = [];
  const chickenIds = Object.keys(State.save.ownedChickens);

  if (chickenIds.length === 0) {
    chickenIds.push("chickA", "chickB", "chickC");
  }

  const baseYaws = [-150, 40, 160];
  const count = chickenIds.length;
  for (let i = 0; i < count; i++) {
    const id = chickenIds[i];
    const data = State.save.ownedChickens[id];
    if (!data) continue;
    if (data.consecutiveHungryDays >= 3) continue;

    const tier = data.tier || "yellow";
    const tierInfo = CHICKEN_TIERS[tier];
    let baseYaw;
    if (i < baseYaws.length) {
      baseYaw = baseYaws[i];
    } else {
      baseYaw = (360 / count) * i - 180;
    }

    chickens.push({
      id,
      type: "chicken",
      label: data.name || tierInfo.name + (i + 1),
      action: "摸摸",
      yaw: baseYaw,
      baseYaw,
      pitch: -22 - (i * 3),
      angle: 17,
      state: "idle",
      color: tierInfo.color,
      tier,
      pet: false,
      bob: Math.random() * Math.PI * 2,
      wander: Math.random() * 5,
      animState: "idle",
      animFrame: 0,
      animTimer: 0,
      dirFrame: 0,
      hungry: !!State.save.chickenHunger?.[id]
    });
  }

  const troughCount = chickens.length;
  for (let i = 0; i < troughCount; i++) {
    const angle = -30 + (troughCount > 1 ? i / (troughCount - 1) : 0.5) * 60;
    troughs.push({
      id: `trough_${i}`,
      type: "trough",
      label: `食槽 ${i + 1}`,
      action: "放干草",
      yaw: angle,
      pitch: -55,
      angle: 13,
      state: "empty"
    });
  }

  const eggs = [];
  const eggPositions = [
    { yaw: -120, pitch: -72 },
    { yaw: 20, pitch: -70 },
    { yaw: 140, pitch: -72 }
  ];
  let eggIdx = 0;

  for (const id of chickenIds) {
    const data = State.save.ownedChickens?.[id];
    if (!data) continue;
    if (data.consecutiveHungryDays >= 3) continue;
    if (State.save.chickenHunger?.[id]) continue;
    if (data.eggCooldown > 0) continue;

    const q = getEggQualityForChicken(id);
    if (!q) continue;

    const pos = eggPositions[eggIdx++] || { yaw: eggIdx * 60 - 120, pitch: -35 };
    eggs.push({
      id: `egg_${id}_${Date.now()}`,
      type: "egg",
      label: q.label,
      action: "拾取",
      yaw: pos.yaw,
      pitch: pos.pitch,
      angle: 15,
      state: "onGround",
      quality: q,
      fromChicken: id
    });
  }

  State.objects = [hopper, ...troughs, ...chickens, ...eggs];
}

function startGame() {
  Audio.ensure();
  if (State.customMode.enabled) {
    State.save.coins = State.customMode.coins;
    State.save.hayStorage = State.customMode.hay;
    const customChickens = {};
    const names = ["米粒", "栗栗", "小葵", "金桔", "银霜", "琥珀", "青草", "暖阳", "星辰"];
    for (let i = 0; i < State.customMode.chickens; i++) {
      const id = `custom_${i}`;
      customChickens[id] = { tier: "yellow", name: names[i] || `小鸡${i+1}`, eggCooldown: 0, consecutiveHungryDays: 0 };
    }
    State.save.ownedChickens = customChickens;
    State.save.friendship = {};
    State.save.chickenHunger = {};
    State.customMode.enabled = false;
  }
  for (const id of Object.keys(State.save.ownedChickens)) {
    const data = State.save.ownedChickens[id];
    if (data.eggCooldown > 0) data.eggCooldown--;
  }
  resetObjects();
  State.screen = "playing";
  State.holding = null;
  State.hayLeft = Math.min(Config.tasks.hay, State.save.hayStorage);
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
  State.shopOverlay = false;
  State.statusPanel = false;
  State.toast = "转动手机，也可按住画面拖动视角";
  State.toastTimer = 2.2;
  State.particles.length = 0;
  State.floaters.length = 0;
  State.totalEggsAtStart = State.objects.filter(o => o.type === "egg" && o.state !== "collected").length;
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

  const isFullyFed = State.feedPlaced >= Config.tasks.hay;

  for (const o of State.objects) {
    if (o.type !== "chicken") continue;
    const data = State.save.ownedChickens?.[o.id];
    if (!data) continue;

    const wasHungry = State.save.chickenHunger?.[o.id];
    const isHungry = !isFullyFed;
    State.save.chickenHunger[o.id] = isHungry;

    if (isHungry) {
      data.consecutiveHungryDays++;
      if (data.consecutiveHungryDays === 2) {
        State.toast = `${o.label}已经连续饿了2天，再不喂食会死！`;
        State.toastTimer = 4;
        addFloater("⚠ 濒死警告", Config.W / 2, 300, "#ff5050");
      }
      if (data.consecutiveHungryDays >= 3) {
        removeDeadChicken(o.id);
        continue;
      }
    } else {
      data.consecutiveHungryDays = 0;
    }

    data.eggCooldown = isHungry ? 2 : 1;

    if (!isHungry && o.pet) {
      State.save.friendship[o.id] = clamp((State.save.friendship[o.id] || 0) + 5, 0, 1000);
      State.sessionFriendshipGain[o.id] = (State.sessionFriendshipGain[o.id] || 0) + 5;
    }
    if (wasHungry && !isHungry) State.sessionFriendshipGain[o.id] = (State.sessionFriendshipGain[o.id] || 0) + 5;

    let gain = 0;
    if (o.pet) gain += 15;
    if (isFullyFed) gain += 8;
    if (completed >= 8) gain += 5;
    if (gain > 0 && !(isFullyFed && !o.pet)) {
      State.save.friendship[o.id] = clamp((State.save.friendship[o.id] || 0) + gain, 0, 1000);
      State.sessionFriendshipGain[o.id] = (State.sessionFriendshipGain[o.id] || 0) + gain;
    }
  }

  const priceMap = { normal: 10, silver: 20, gold: 50, rare: 100 };
  State.sessionCoins = 0;
  for (const egg of State.collectedEggs) {
    State.sessionCoins += priceMap[egg.key] || 10;
  }
  State.save.coins += State.sessionCoins;
  saveSlot(State.currentSlot);
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
    State.objects = State.objects.filter(o => o.id !== obj.id);
    obj.state = "collected";
    State.eggsCollected += 1;
    State.collectedEggs.push(obj.quality);
    checkMilestones();
    addFloater(`+1 ${obj.quality.label}`, tx, ty - 28, obj.quality.sparkle);
    sparkle(tx, ty);
    Audio.beep("egg");
    vibrate(25);
  }
  const totalHay = State.objects.filter(o => o.type === "trough").length;
  const totalChickens = State.objects.filter(o => o.type === "chicken").length;
  const totalEggs = State.totalEggsAtStart;
  if (State.feedPlaced >= totalHay && State.petsDone >= totalChickens && State.eggsCollected >= totalEggs) {
    setTimeout(() => endGame(false), 550);
  }
}

function checkMilestones() {
  const totalHay = State.objects.filter(o => o.type === "trough").length;
  const totalChickens = State.objects.filter(o => o.type === "chicken").length;
  const totalEggs = State.totalEggsAtStart;
  const marks = [
    ["fed", State.feedPlaced >= totalHay, `所有食槽都放好啦`],
    ["pet", State.petsDone >= totalChickens, `所有小鸡都开心啦`],
    ["egg", State.eggsCollected >= totalEggs, `所有鸡蛋都收齐啦`]
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
  State.save.ownedChickens = {};
  migrateLegacyData();
  saveGame();
}

function buyChicken(tier) {
  const tierInfo = CHICKEN_TIERS[tier];
  if (!tierInfo) return;
  if (State.save.coins < tierInfo.price) {
    State.toast = "金币不足";
    State.toastTimer = 1.2;
    Audio.beep("miss");
    return;
  }
  State.save.coins -= tierInfo.price;

  const existingYaws = State.objects
    .filter(o => o.type === "chicken")
    .map(o => o.yaw);

  let spawnYaw = 0;
  if (existingYaws.length > 0) {
    let maxGap = 0;
    let bestYaw = 0;
    for (let i = 0; i < existingYaws.length; i++) {
      const nextYaw = existingYaws[(i + 1) % existingYaws.length];
      let gap = Math.abs(normDeg(nextYaw - existingYaws[i]));
      if (gap > maxGap) {
        maxGap = gap;
        bestYaw = normDeg(existingYaws[i] + gap / 2);
      }
    }
    spawnYaw = bestYaw;
  }

  const count = Object.keys(State.save.ownedChickens).length + 1;
  const newId = `chick_${Date.now()}`;
  const name = tierInfo.name + count;

  State.save.ownedChickens[newId] = {
    tier,
    name,
    eggCooldown: 0,
    consecutiveHungryDays: 0
  };
  State.save.friendship[newId] = 0;
  State.save.chickenHunger[newId] = false;

  State.objects.push({
    id: newId,
    type: "chicken",
    label: name,
    action: "摸摸",
    yaw: spawnYaw,
    baseYaw: spawnYaw,
    pitch: -22 - Math.random() * 6,
    angle: 17,
    state: "idle",
    color: tierInfo.color,
    tier,
    pet: false,
    bob: Math.random() * Math.PI * 2,
    wander: Math.random() * 5,
    animState: "idle",
    animFrame: 0,
    animTimer: 0,
    dirFrame: 0,
    hungry: false
  });

  const troughCount = State.objects.filter(o => o.type === "trough").length;
  const newTroughId = `trough_${Date.now()}`;
  const troughYaw = spawnYaw + 35;
  State.objects.push({
    id: newTroughId,
    type: "trough",
    label: `食槽 ${troughCount + 1}`,
    action: "放干草",
    yaw: troughYaw,
    pitch: -18,
    angle: 13,
    state: "empty"
  });

  saveGame();
  State.toast = `新伙伴 ${name} 加入啦！`;
  State.toastTimer = 2;
  Audio.beep("win");
}

function removeDeadChicken(id) {
  const chicken = State.objects.find(o => o.id === id);
  if (chicken) {
    State.toast = `${chicken.label} 饿死了...`;
    State.toastTimer = 4;
    Audio.beep("miss");
    State.objects = State.objects.filter(o => o.id !== id);
  }
  delete State.save.ownedChickens[id];
  delete State.save.friendship[id];
  delete State.save.chickenHunger[id];
  saveGame();
}