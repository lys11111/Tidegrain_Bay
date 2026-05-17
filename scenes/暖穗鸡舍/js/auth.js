"use strict";

function sha256(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(16, "0");
}

function createEmptySlot() {
  return {
    days: 0, eggs: 0, bestClear: 0, perfectDays: 0,
    friendship: {}, eggQuality: { normal: 0, silver: 0, gold: 0, rare: 0 },
    coins: 0, hayStorage: 10, heatLamp: false,
    chickenHunger: {}, ownedChickens: {}
  };
}

function registerUser(username, password) {
  if (!username || username.length < 2) return "用户名至少2个字符";
  if (!password || password.length < 4) return "密码至少4个字符";
  if (State.save.users[username]) return "用户名已存在";
  State.save.users[username] = {
    passwordHash: sha256(password + username),
    createdAt: Date.now(),
    slots: [createEmptySlot(), createEmptySlot(), createEmptySlot()]
  };
  State.save.currentUser = username;
  State.slots = State.save.users[username].slots;
  State.currentSlot = 0;
  State.save.currentSlot = 0;
  return null;
}

function loginUser(username, password) {
  const user = State.save.users[username];
  if (!user) return "用户名不存在";
  const hash = sha256(password + username);
  if (hash !== user.passwordHash) return "密码错误";
  State.save.currentUser = username;
  State.slots = user.slots || [createEmptySlot(), createEmptySlot(), createEmptySlot()];
  State.currentSlot = State.save.currentSlot || 0;
  return null;
}

function logoutUser() {
  saveSlot(State.currentSlot);
  State.save.currentUser = null;
  State.screen = "auth";
  State.authUsername = "";
  State.authPassword = "";
}

function isLoggedIn() {
  return !!State.save.currentUser;
}

function loadSlot(slotIdx) {
  const slot = State.slots[slotIdx];
  if (!slot) return;
  State.save.days = slot.days || 0;
  State.save.eggs = slot.eggs || 0;
  State.save.bestClear = slot.bestClear || 0;
  State.save.perfectDays = slot.perfectDays || 0;
  State.save.friendship = Object.assign({}, slot.friendship || {});
  State.save.eggQuality = Object.assign({ normal: 0, silver: 0, gold: 0, rare: 0 }, slot.eggQuality || {});
  State.save.coins = slot.coins || 0;
  State.save.hayStorage = slot.hayStorage !== undefined ? slot.hayStorage : 10;
  State.save.heatLamp = slot.heatLamp || false;
  State.save.chickenHunger = Object.assign({}, slot.chickenHunger || {});
  State.save.ownedChickens = Object.assign({}, slot.ownedChickens || {});
  if (Object.keys(State.save.ownedChickens).length === 0) {
    migrateLegacyData();
  }
}

function saveSlot(slotIdx) {
  const slot = State.slots[slotIdx];
  if (!slot) return;
  slot.days = State.save.days;
  slot.eggs = State.save.eggs;
  slot.bestClear = State.save.bestClear;
  slot.perfectDays = State.save.perfectDays;
  slot.friendship = Object.assign({}, State.save.friendship);
  slot.eggQuality = Object.assign({}, State.save.eggQuality);
  slot.coins = State.save.coins;
  slot.hayStorage = State.save.hayStorage;
  slot.heatLamp = State.save.heatLamp;
  slot.chickenHunger = Object.assign({}, State.save.chickenHunger);
  slot.ownedChickens = Object.assign({}, State.save.ownedChickens);
}

function selectSlot(slotIdx) {
  saveSlot(State.currentSlot);
  State.currentSlot = slotIdx;
  State.save.currentSlot = slotIdx;
  loadSlot(slotIdx);
}

function createNewSlot(slotIdx) {
  State.slots[slotIdx] = createEmptySlot();
  migrateLegacyData();
  selectSlot(slotIdx);
}

function createCustomSlot(slotIdx, cm) {
  const slot = createEmptySlot();
  const names = ["米粒", "栗栗", "小葵", "金桔", "银霜", "琥珀", "青草", "暖阳", "星辰"];
  for (let i = 0; i < cm.chickens; i++) {
    const id = `custom_${i}`;
    slot.ownedChickens[id] = { tier: "yellow", name: names[i] || `小鸡${i+1}`, eggCooldown: 0, consecutiveHungryDays: 0 };
    slot.friendship[id] = 0;
    slot.chickenHunger[id] = false;
  }
  slot.coins = cm.coins;
  slot.hayStorage = cm.hay;
  State.slots[slotIdx] = slot;
  selectSlot(slotIdx);
}

function migrateLegacyData() {
  const legacyIds = ["chickA", "chickB", "chickC"];
  for (const id of legacyIds) {
    if (!State.save.ownedChickens[id]) {
      State.save.ownedChickens[id] = {
        tier: "yellow",
        name: id === "chickA" ? "米粒" : id === "chickB" ? "栗栗" : "小葵",
        eggCooldown: 0,
        consecutiveHungryDays: State.save.chickenHunger?.[id] ? 1 : 0
      };
    }
  }
}