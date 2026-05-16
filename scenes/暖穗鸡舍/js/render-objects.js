"use strict";

function drawObjects() {
  const ordered = State.objects.map(o => ({ o, p: project(o) })).filter(v => v.p);
  ordered.sort((a, b) => a.p.y - b.p.y);
  for (const { o, p } of ordered) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.scale(p.scale, p.scale);
    if (o.type === "hopper") drawHopper();
    if (o.type === "trough") drawTrough(o);
    if (o.type === "chicken") drawChicken(o);
    if (o.type === "egg") drawEgg(o);
    ctx.restore();
  }
}

function drawGlow(o) {
  ctx.save();
  ctx.globalAlpha = 0.5 + Math.sin(performance.now() * 0.008) * 0.15;
  ctx.fillStyle = "#fff2a6";
  const r = o.type === "chicken" ? 34 : 28;
  ctx.beginPath();
  ctx.ellipse(0, 2, r, r * 0.75, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawHopper() {
  if (Assets.loaded && Assets.imgs.hopper) {
    ctx.drawImage(Assets.imgs.hopper, -32, -48, 64, 64);
  } else {
    ctx.fillStyle = "#6d4328";
    roundRect(-28, -24, 56, 48, 7, true);
    ctx.fillStyle = "#4b2d1e";
    ctx.fillRect(-22, -2, 44, 8);
  }
}

function drawTrough(o) {
  if (Assets.loaded) {
    const img = o.state === "filled" ? Assets.imgs.trough_filled : Assets.imgs.trough_empty;
    if (img) ctx.drawImage(img, -36, -24, 72, 48);
  } else {
    ctx.fillStyle = "#75462b";
    roundRect(-33, -12, 66, 24, 7, true);
    ctx.fillStyle = "#4d2d1f";
    roundRect(-27, -7, 54, 12, 5, true);
  }
  if (o.state === "filled" && State.lastFedId === o.id && performance.now() - (o.filledAt || 0) < 1200) {
    ctx.save();
    ctx.globalAlpha = 0.45 + Math.sin(performance.now() * 0.02) * 0.15;
    ctx.strokeStyle = "#fff0a7";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(0, -5, 40, 22, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}

function drawChicken(o) {
  const hop = Math.sin(o.bob) * (o.state === "happy" ? 4 : 1.5);
  ctx.translate(0, hop);

  ctx.fillStyle = "rgba(55, 25, 15, .18)";
  ctx.beginPath();
  ctx.ellipse(0, 24, 28, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  let frameKey;
  if (o.animState === "idle") {
    frameKey = Assets.frames.dir[o.dirFrame];
  } else {
    frameKey = Assets.frames[o.animState]?.[o.animFrame];
  }
  if (Assets.loaded && frameKey) {
    const img = Assets.imgs[`小鸡状态图/${frameKey}`];
    if (img) ctx.drawImage(img, -28, -48, 56, 56);
  } else if (Assets.loaded && Assets.imgs.chicken_yellow) {
    ctx.drawImage(Assets.imgs.chicken_yellow, -28, -48, 56, 56);
  } else {
    ctx.fillStyle = o.color;
    ctx.beginPath();
    ctx.ellipse(0, 0, 22, 24, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  if (o.pet) {
    safeText("♥", -20, -38, 18, "#ff6f9c");
  }
  const friendship = getFriendship(o.id);
  const heartCount = heartsFromFriendship(friendship);
  if (heartCount > 0) {
    safeText("♥".repeat(heartCount), 0, 39, 10, "#ff7aa8");
  }
  if (o.state === "eat") {
    ctx.fillStyle = "rgba(255, 236, 164, .92)";
    roundRect(-30, -61, 60, 21, 8, true);
    safeText("吃饭中", 0, -50, 11, "#6b4328");
  }
}

function drawEgg(o) {
  ctx.fillStyle = "rgba(55, 25, 15, .18)";
  ctx.beginPath();
  ctx.ellipse(0, 17, 17, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  if (Assets.loaded) {
    const key = o.quality ? o.quality.key : "normal";
    const img = Assets.imgs[`egg_${key}`];
    if (img) {
      ctx.drawImage(img, -18, -24, 36, 36);
    }
  } else {
    ctx.fillStyle = o.quality ? o.quality.color : "#fff4d2";
    ctx.beginPath();
    ctx.ellipse(0, 0, 13, 18, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  if (o.quality && o.quality.key !== "normal") {
    safeText("✦", 0, -24, 13, o.quality.sparkle);
  }
}

function drawObjectLabel(o) {
  ctx.fillStyle = "rgba(55, 34, 25, .76)";
  const isChicken = o.type === "chicken";
  roundRect(isChicken ? -56 : -42, -58, isChicken ? 112 : 84, isChicken ? 36 : 22, 8, true);
  safeText(o.action, 0, isChicken ? -49 : -47, 12, "#fff5d2");
  if (isChicken) {
    const friendship = getFriendship(o.id);
    safeText(`${o.label} ${heartsFromFriendship(friendship)}/5心`, 0, -33, 10, "#ffe4a8");
  }
}