"use strict";

function loadSave() {
  try {
    const raw = localStorage.getItem(Config.storageKey);
    if (raw) {
      const parsed = JSON.parse(raw);
      State.save = Object.assign(State.save, parsed);
      State.save.bestClear = parsed.bestClear || 0;
      State.save.perfectDays = parsed.perfectDays || 0;
      State.save.friendship = Object.assign({}, State.save.friendship || {}, parsed.friendship || {});
      State.save.eggQuality = Object.assign({ normal: 0, silver: 0, gold: 0, rare: 0 }, parsed.eggQuality || {});
      State.save.coins = parsed.coins || 0;
      State.save.hayStorage = parsed.hayStorage !== undefined ? parsed.hayStorage : 10;
      State.save.heatLamp = parsed.heatLamp || false;
      State.save.chickenHunger = Object.assign({}, State.save.chickenHunger || {}, parsed.chickenHunger || {});
    }
  } catch (_) {}
}

function saveGame() {
  try { localStorage.setItem(Config.storageKey, JSON.stringify(State.save)); } catch (_) {}
}

function getFriendship(id) {
  return clamp(State.save.friendship[id] || 0, 0, 1000);
}

function heartsFromFriendship(value) {
  return clamp(Math.floor(value / 200), 0, 5);
}

function getEggQualityForChicken(id) {
  const friendship = getFriendship(id);
  const isHungry = State.save.chickenHunger?.[id];
  if (isHungry) return null;
  const base = friendship / 1000;
  const heat = State.save.heatLamp ? 0.15 : 0;
  const r = Math.random();
  if (r < base * 0.4 + heat) return { key: "rare", label: "稀有蛋", color: "#d8b4ff", sparkle: "#f3ddff" };
  if (r < base * 0.7 + heat) return { key: "gold", label: "金星蛋", color: "#ffe07a", sparkle: "#fff3a8" };
  if (r < base * 0.9 + heat) return { key: "silver", label: "银星蛋", color: "#e7edf4", sparkle: "#ffffff" };
  return { key: "normal", label: "普通蛋", color: "#fff4d2", sparkle: "#ffffff" };
}

function getEggQuality() {
  const ids = ["chickA", "chickB", "chickC"];
  const avg = ids.reduce((sum, id) => sum + getFriendship(id), 0) / ids.length;
  const bonus = State.save.heatLamp ? 300 : 0;
  if (avg + bonus >= 900) return { key: "rare", label: "稀有蛋", color: "#d8b4ff", sparkle: "#f3ddff" };
  if (avg + bonus >= 600) return { key: "gold", label: "金星蛋", color: "#ffe07a", sparkle: "#fff3a8" };
  if (avg + bonus >= 200) return { key: "silver", label: "银星蛋", color: "#e7edf4", sparkle: "#ffffff" };
  return { key: "normal", label: "普通蛋", color: "#fff4d2", sparkle: "#ffffff" };
}