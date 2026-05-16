"use strict";

function pointerDown(e) {
  e.preventDefault();
  Audio.ensure();
  const p = getPoint(e);
  State.drag.active = true;
  State.drag.moved = false;
  State.drag.canPan = State.screen === "playing" && !State.paused && !isPlayingControl(p.x, p.y);
  State.drag.x = p.x;
  State.drag.y = p.y;
}

function pointerMove(e) {
  if (!State.drag.active) return;
  e.preventDefault();
  const p = getPoint(e);
  const dx = p.x - State.drag.x;
  const dy = p.y - State.drag.y;
  if (Math.hypot(dx, dy) > 2) State.drag.moved = true;
  State.drag.x = p.x;
  State.drag.y = p.y;
  if (State.drag.canPan) {
    State.drag.yaw = normDeg(State.drag.yaw - dx * 0.32);
    State.drag.pitch = clamp(State.drag.pitch + dy * 0.11, -Config.pitchRange, Config.pitchRange);
  }
}

function pointerUp(e) {
  e.preventDefault();
  const p = getPoint(e.changedTouches ? e.changedTouches[0] : e);
  const wasDrag = State.drag.moved;
  const canPan = State.drag.canPan;
  State.drag.active = false;
  State.drag.moved = false;
  State.drag.canPan = false;
  if (wasDrag && canPan) return;
  handleTap(p.x, p.y);
}

function isPlayingControl(x, y) {
  return hit(x, y, 16, 584, 64, 34) || hit(x, y, 90, 584, 64, 34);
}

function handleTap(x, y) {
  if (State.screen === "permission") {
    requestMotionAndStart();
  } else if (State.screen === "calibrate") {
    calibrate();
    startGame();
  } else if (State.screen === "menu") {
    if (hit(x, y, 86, 315, 188, 48)) {
      if (State.permissionAsked) {
        State.screen = "calibrate";
      } else {
        requestMotionAndStart();
      }
    } else if (hit(x, y, 86, 378, 188, 48)) {
      State.screen = "shop";
    } else if (hit(x, y, 86, 441, 188, 40)) {
      newGame();
      State.permissionAsked = false;
      State.sensorMode = "drag";
      State.sensorReady = false;
      State.desktopSim = false;
      State.screen = "permission";
    } else if (hit(x, y, 104, 498, 152, 40)) {
      State.sensorMode = "drag";
      State.sensorReady = false;
      State.desktopSim = true;
      State.screen = "calibrate";
    }
  } else if (State.screen === "shop") {
    if (hit(x, y, 50, 330, 260, 50)) {
      if (State.save.coins >= 50) {
        State.save.coins -= 50;
        State.save.hayStorage += 10;
        saveGame();
        Audio.beep("pet");
      } else { Audio.beep("miss"); }
    } else if (hit(x, y, 50, 408, 260, 50) && !State.save.heatLamp) {
      if (State.save.coins >= 500) {
        State.save.coins -= 500;
        State.save.heatLamp = true;
        saveGame();
        Audio.beep("win");
      } else { Audio.beep("miss"); }
    } else if (hit(x, y, 104, 545, 152, 40)) {
      State.screen = "menu";
    }
  } else if (State.screen === "playing") {
    if (State.paused) {
      if (hit(x, y, 86, 340, 188, 48)) {
        State.paused = false;
      } else if (hit(x, y, 86, 400, 188, 48)) {
        saveAndQuit();
      } else if (hit(x, y, 104, 460, 152, 40)) {
        saveGame();
        State.paused = false;
        State.screen = "menu";
      }
    } else if (hit(x, y, 16, 584, 64, 34)) {
      State.paused = true;
    } else if (hit(x, y, 90, 584, 64, 34)) {
      endGame(false);
    } else {
      interact(x, y);
    }
  } else if (State.screen === "nextday") {
    if (hit(x, y, 86, 440, 188, 48)) {
      State.screen = "calibrate";
    } else if (hit(x, y, 104, 506, 152, 40)) {
      State.screen = "menu";
    }
  } else if (State.screen === "result") {
    if (hit(x, y, 86, 385, 188, 48)) startGame();
    else if (hit(x, y, 104, 445, 152, 40)) State.screen = "menu";
  }
}