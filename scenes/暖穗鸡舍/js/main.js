"use strict";

function update(dt) {
  updateLook();
  if (State.screen === "playing") {
    State.timeLeft -= dt;
    if (State.timeLeft <= 0) {
      State.timeLeft = 0;
      endGame(true);
    }
    for (const o of State.objects) {
      if (o.type === "chicken") {
        o.bob += dt * 3;
        o.wander += dt;
        const fpsMap = { idle: 1.5, happy: 8, peck: 10, dir: 4 };
        const fps = fpsMap[o.animState] || 4;
        o.animTimer += dt;
        const interval = 1 / fps;
        if (o.animTimer >= interval) {
          o.animTimer -= interval;
          const frames = Assets.frames[o.animState] || Assets.frames.idle;
          o.animFrame = (o.animFrame + 1) % frames.length;
        }
        o.dirFrame = Math.floor((Math.sin(o.wander * 0.5) + 1) * 3) % 6;
        if (o.state === "eat") {
          o.eatTimer = Math.max(0, (o.eatTimer || 0) - dt);
          o.animState = "peck";
          if (o.eatTimer <= 0) {
            o.state = o.pet ? "happy" : "idle";
            o.animState = o.state;
            o.animFrame = 0;
            o.animTimer = 0;
          }
        } else if (o.state === "happy") {
          o.happyTimer = Math.max(0, (o.happyTimer || 0) - dt);
          o.animState = "happy";
          if (o.happyTimer <= 0) {
            o.state = "idle";
            o.animState = "idle";
            o.animFrame = 0;
            o.animTimer = 0;
          }
        } else if (o.animState !== "peck") {
          o.animState = "idle";
        }
        if (o.state === "happy" && Math.random() < dt * 0.55) {
          const p = project(o);
          if (p) burstHearts(p.x, p.y - 35);
        }
      }
    }
  }
  for (let i = State.particles.length - 1; i >= 0; i--) {
    const p = State.particles[i];
    p.life -= dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += 45 * dt;
    if (p.life <= 0) State.particles.splice(i, 1);
  }
  for (let i = State.floaters.length - 1; i >= 0; i--) {
    const f = State.floaters[i];
    f.life -= dt;
    f.y -= 24 * dt;
    if (f.life <= 0) State.floaters.splice(i, 1);
  }
  if (State.toastTimer > 0) State.toastTimer -= dt;
}

function render() {
  ctx.clearRect(0, 0, Config.W, Config.H);
  if (State.screen === "boot") drawBoot();
  else if (State.screen === "permission") drawPermission();
  else if (State.screen === "calibrate") drawCalibrate();
  else if (State.screen === "menu") drawMenu();
  else if (State.screen === "shop") drawShop();
  else if (State.screen === "playing") {
    drawBackground();
    drawObjects();
    drawParticles();
    drawHud();
    drawToast();
    if (State.paused) drawPauseMenu();
  } else if (State.screen === "nextday") drawNextDay();
  else if (State.screen === "result") drawResult();
  else drawError();
}

function loop(ts) {
  try {
    const dt = Math.min(0.05, (ts - (State.lastTime || ts)) / 1000);
    State.lastTime = ts;
    update(dt);
    render();
    requestAnimationFrame(loop);
  } catch (err) {
    console.error(err);
    drawError(Config.errorText);
  }
}

function init() {
  try {
    loadSave();
    resetObjects();
    window.addEventListener("deviceorientation", onOrientation, true);
    canvas.addEventListener("pointerdown", pointerDown, { passive: false });
    canvas.addEventListener("pointermove", pointerMove, { passive: false });
    canvas.addEventListener("pointerup", pointerUp, { passive: false });
    canvas.addEventListener("pointercancel", pointerUp, { passive: false });
    document.addEventListener("touchmove", e => e.preventDefault(), { passive: false });
    Assets.load().then(() => {
      requestAnimationFrame(loop);
    });
  } catch (err) {
    console.error(err);
    drawError(Config.errorText);
  }
}

init();