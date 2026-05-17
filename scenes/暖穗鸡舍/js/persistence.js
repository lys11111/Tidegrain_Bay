"use strict";

function loadSave() {
  try {
    const raw = localStorage.getItem(Config.storageKey);
    if (raw) {
      const parsed = JSON.parse(raw);
      State.save.users = parsed.users || {};
      State.save.currentUser = parsed.currentUser || null;
      State.save.currentSlot = parsed.currentSlot || 0;
      if (State.save.currentUser && State.save.users[State.save.currentUser]) {
        State.slots = State.save.users[State.save.currentUser].slots || [];
      }
      if (State.slots.length === 0) {
        State.slots = [null, null, null];
      }
    }
  } catch (_) {}
}

function saveGame() {
  try {
    if (State.save.currentUser && State.save.users[State.save.currentUser]) {
      State.save.users[State.save.currentUser].slots = State.slots;
    }
    localStorage.setItem(Config.storageKey, JSON.stringify(State.save));
  } catch (_) {}
}

function getFriendship(id) {
  return clamp(State.save.friendship[id] || 0, 0, 1000);
}

function heartsFromFriendship(value) {
  return clamp(Math.floor(value / 200), 0, 5);
}

function getEggQualityForChicken(id) {
  const data = State.save.ownedChickens?.[id];
  if (!data) return null;
  if (data.consecutiveHungryDays >= 3) return null;
  if (State.save.chickenHunger?.[id]) return null;
  if (data.eggCooldown > 0) return null;

  const tierBonus = { yellow: 0, white: 0.12, brown: 0.22 }[data.tier] || 0;
  const friendBonus = getFriendship(id) / 1000 * 0.5;
  const heatBonus = State.save.heatLamp ? 0.12 : 0;
  const total = tierBonus + friendBonus + heatBonus;

  const r = Math.random();
  if (r < total * 0.45) return { key: "rare", label: "稀有蛋", color: "#d8b4ff", sparkle: "#f3ddff" };
  if (r < total * 0.70) return { key: "gold", label: "金星蛋", color: "#ffe07a", sparkle: "#fff3a8" };
  if (r < total * 0.90) return { key: "silver", label: "银星蛋", color: "#e7edf4", sparkle: "#ffffff" };
  return { key: "normal", label: "普通蛋", color: "#fff4d2", sparkle: "#ffffff" };
}

function getEggQuality() {
  const ids = Object.keys(State.save.ownedChickens).length > 0
    ? Object.keys(State.save.ownedChickens)
    : ["chickA", "chickB", "chickC"];
  let totalBonus = 0;
  let count = 0;
  for (const id of ids) {
    if (State.save.chickenHunger?.[id]) continue;
    const data = State.save.ownedChickens?.[id];
    const tier = data?.tier || "yellow";
    const tierBonus = { yellow: 0, white: 0.12, brown: 0.22 }[tier] || 0;
    totalBonus += tierBonus + getFriendship(id) / 1000 * 0.5;
    count++;
  }
  if (count === 0) return { key: "normal", label: "普通蛋", color: "#fff4d2", sparkle: "#ffffff" };

  const avgBonus = totalBonus / count;
  const heat = State.save.heatLamp ? 0.12 : 0;
  const r = Math.random();
  if (r < avgBonus * 0.45 + heat) return { key: "rare", label: "稀有蛋", color: "#d8b4ff", sparkle: "#f3ddff" };
  if (r < avgBonus * 0.70 + heat) return { key: "gold", label: "金星蛋", color: "#ffe07a", sparkle: "#fff3a8" };
  if (r < avgBonus * 0.90 + heat) return { key: "silver", label: "银星蛋", color: "#e7edf4", sparkle: "#ffffff" };
  return { key: "normal", label: "普通蛋", color: "#fff4d2", sparkle: "#ffffff" };
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