"use strict";

var authUserInput = document.getElementById("authUserInput");
var authPassInput = document.getElementById("authPassInput");

function showAuthInputs() {
  authUserInput.style.display = "block";
  authPassInput.style.display = "block";
  authUserInput.value = State.authUsername;
  authPassInput.value = State.authPassword;
}

function hideAuthInputs() {
  authUserInput.style.display = "none";
  authPassInput.style.display = "none";
  authUserInput.value = "";
  authPassInput.value = "";
  State.authUsername = "";
  State.authPassword = "";
}

authUserInput.addEventListener("input", function() {
  State.authUsername = authUserInput.value;
});

authPassInput.addEventListener("input", function() {
  State.authPassword = authPassInput.value;
});

authUserInput.addEventListener("blur", function() {
  setTimeout(() => {}, 10);
});

authPassInput.addEventListener("blur", function() {
  setTimeout(() => {}, 10);
});

function handleTouchStart(e) {
  e.preventDefault();
  Audio.ensure();
  const t = e.touches[0];
  const r = canvas.getBoundingClientRect();
  const p = {
    x: (t.clientX - r.left) * Config.W / r.width,
    y: (t.clientY - r.top) * Config.H / r.height
  };
  State.drag.active = true;
  State.drag.moved = false;
  State.drag.canPan = State.screen === "playing" && !State.paused && !State.shopOverlay && !State.statusPanel && !isPlayingControl(p.x, p.y);
  State.drag.x = p.x;
  State.drag.y = p.y;
  State.pressedButton = null;
  for (const btn of getAllButtonAreas()) {
    if (hit(p.x, p.y, btn.x, btn.y, btn.w, btn.h)) {
      State.pressedButton = btn.tag;
      break;
    }
  }
}

function handleTouchMove(e) {
  if (!State.drag.active) return;
  e.preventDefault();
  State.pressedButton = null;
  const t = e.touches[0];
  const r = canvas.getBoundingClientRect();
  const p = {
    x: (t.clientX - r.left) * Config.W / r.width,
    y: (t.clientY - r.top) * Config.H / r.height
  };
  const dx = p.x - State.drag.x;
  const dy = p.y - State.drag.y;
  if (Math.hypot(dx, dy) > 2) State.drag.moved = true;
  State.drag.x = p.x;
  State.drag.y = p.y;
  if (State.drag.canPan) {
    State.drag.yaw += dx * 0.32;
    State.drag.pitch = clamp(State.drag.pitch - dy * 0.11, -Config.pitchRange, Config.pitchRange);
  }
}

function handleTouchEnd(e) {
  if (!State.drag.active) return;
  e.preventDefault();
  const r = canvas.getBoundingClientRect();
  const t = e.changedTouches ? e.changedTouches[0] : (e.touches ? e.touches[0] : e);
  const p = { x: (t.clientX - r.left) * Config.W / r.width, y: (t.clientY - r.top) * Config.H / r.height };
  const wasDrag = State.drag.moved;
  const canPan = State.drag.canPan;
  State.drag.active = false;
  State.drag.moved = false;
  State.drag.canPan = false;
  State.pressedButton = null;
  if (wasDrag && canPan) return;
  handleTap(p.x, p.y);
}

function pointerDown(e) {
  e.preventDefault();
  Audio.ensure();
  const p = getPoint(e);
  State.drag.active = true;
  State.drag.moved = false;
  State.drag.canPan = State.screen === "playing" && !State.paused && !State.shopOverlay && !State.statusPanel && !isPlayingControl(p.x, p.y);
  State.drag.x = p.x;
  State.drag.y = p.y;
  State.pressedButton = null;
  for (const btn of getAllButtonAreas()) {
    if (hit(p.x, p.y, btn.x, btn.y, btn.w, btn.h)) {
      State.pressedButton = btn.tag;
      break;
    }
  }
}

function getAllButtonAreas() {
  const areas = [];
  if (State.screen === "playing") {
    areas.push({ x: 10, y: 584, w: 52, h: 34, tag: "playing,10,584,52,34" });
    areas.push({ x: 66, y: 584, w: 52, h: 34, tag: "playing,66,584,52,34" });
    areas.push({ x: 122, y: 584, w: 52, h: 34, tag: "playing,122,584,52,34" });
    areas.push({ x: 178, y: 584, w: 52, h: 34, tag: "playing,178,584,52,34" });
    areas.push({ x: 234, y: 584, w: 52, h: 34, tag: "playing,234,584,52,34" });
    areas.push({ x: 290, y: 584, w: 60, h: 34, tag: "playing,290,584,60,34" });
    if (State.paused) {
      areas.push({ x: 86, y: 340, w: 188, h: 48, tag: "playing,86,340,188,48" });
      areas.push({ x: 86, y: 400, w: 188, h: 48, tag: "playing,86,400,188,48" });
      areas.push({ x: 104, y: 460, w: 152, h: 40, tag: "playing,104,460,152,40" });
    }
    if (State.shopOverlay) {
      areas.push({ x: 50, y: 158, w: 200, h: 38, tag: "playing,50,158,200,38" });
      areas.push({ x: 50, y: 256, w: 200, h: 32, tag: "playing,50,256,200,32" });
      areas.push({ x: 200, y: 340, w: 100, h: 36, tag: "playing,200,340,100,36" });
      areas.push({ x: 200, y: 412, w: 100, h: 36, tag: "playing,200,412,100,36" });
      areas.push({ x: 200, y: 484, w: 100, h: 36, tag: "playing,200,484,100,36" });
      areas.push({ x: 104, y: 555, w: 152, h: 40, tag: "playing,104,555,152,40" });
    }
  } else if (State.screen === "customselect") {
    areas.push({ x: 10, y: 150, w: 155, h: 75, tag: "customselect,10,150,155,75" });
    areas.push({ x: 195, y: 150, w: 155, h: 75, tag: "customselect,195,150,155,75" });
    areas.push({ x: 104, y: 545, w: 152, h: 40, tag: "customselect,104,545,152,40" });
  } else if (State.screen === "cmsetup") {
    areas.push({ x: 30, y: 175, w: 60, h: 30, tag: "cmsetup,30,175,60,30" });
    areas.push({ x: 90, y: 175, w: 60, h: 30, tag: "cmsetup,90,175,60,30" });
    areas.push({ x: 155, y: 175, w: 60, h: 30, tag: "cmsetup,155,175,60,30" });
    areas.push({ x: 220, y: 175, w: 60, h: 30, tag: "cmsetup,220,175,60,30" });
    areas.push({ x: 30, y: 255, w: 60, h: 30, tag: "cmsetup,30,255,60,30" });
    areas.push({ x: 90, y: 255, w: 60, h: 30, tag: "cmsetup,90,255,60,30" });
    areas.push({ x: 150, y: 255, w: 60, h: 30, tag: "cmsetup,150,255,60,30" });
    areas.push({ x: 210, y: 255, w: 60, h: 30, tag: "cmsetup,210,255,60,30" });
    areas.push({ x: 30, y: 335, w: 60, h: 30, tag: "cmsetup,30,335,60,30" });
    areas.push({ x: 90, y: 335, w: 60, h: 30, tag: "cmsetup,90,335,60,30" });
    areas.push({ x: 150, y: 335, w: 60, h: 30, tag: "cmsetup,150,335,60,30" });
    areas.push({ x: 210, y: 335, w: 60, h: 30, tag: "cmsetup,210,335,60,30" });
    areas.push({ x: 56, y: 415, w: 248, h: 50, tag: "cmsetup,56,415,248,50" });
    areas.push({ x: 104, y: 485, w: 152, h: 40, tag: "cmsetup,104,485,152,40" });
  }
  return areas;
}

function pointerMove(e) {
  if (!State.drag.active) return;
  e.preventDefault();
  State.pressedButton = null;
  const p = getPoint(e);
  const dx = p.x - State.drag.x;
  const dy = p.y - State.drag.y;
  if (Math.hypot(dx, dy) > 2) State.drag.moved = true;
  State.drag.x = p.x;
  State.drag.y = p.y;
  if (State.drag.canPan) {
    State.drag.yaw += dx * 0.32;
    State.drag.pitch = clamp(State.drag.pitch - dy * 0.11, -Config.pitchRange, Config.pitchRange);
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
  State.pressedButton = null;
  if (wasDrag && canPan) return;
  handleTap(p.x, p.y);
}

function isPlayingControl(x, y) {
  return hit(x, y, 10, 584, 52, 34) ||
         hit(x, y, 66, 584, 52, 34) ||
         hit(x, y, 122, 584, 52, 34) ||
         hit(x, y, 178, 584, 52, 34) ||
         hit(x, y, 234, 584, 52, 34) ||
         hit(x, y, 290, 584, 60, 34);
}

function handleAuthTap(x, y) {
  if (hit(x, y, 50, 150, 260, 46)) {
    State.authFocus = "username";
    State.authError = "";
    showAuthInputs();
    setTimeout(() => { authUserInput.focus(); }, 10);
  } else if (hit(x, y, 50, 210, 260, 46)) {
    State.authFocus = "password";
    State.authError = "";
    showAuthInputs();
    setTimeout(() => { authPassInput.focus(); }, 10);
  } else if (hit(x, y, 86, 360, 188, 48)) {
    if (State.authScreen === "login") {
      const err = loginUser(State.authUsername, State.authPassword);
      if (err) State.authError = err;
      else { hideAuthInputs(); State.screen = "slots"; State.authUsername = ""; State.authPassword = ""; }
    } else {
      const err = registerUser(State.authUsername, State.authPassword);
      if (err) State.authError = err;
      else { hideAuthInputs(); State.screen = "slots"; State.authUsername = ""; State.authPassword = ""; }
    }
  } else if (hit(x, y, 86, 420, 188, 40)) {
    State.authScreen = State.authScreen === "login" ? "register" : "login";
    State.authError = "";
  }
}

function handleAuthKey(e) {
  if (State.screen !== "auth") return;
  if (document.hasFocus && document.hasFocus() && document.activeElement &&
      (document.activeElement === authUserInput || document.activeElement === authPassInput)) return;
  if (e.key === "Backspace") {
    if (State.authFocus === "username") {
      State.authUsername = State.authUsername.slice(0, -1);
    } else {
      State.authPassword = State.authPassword.slice(0, -1);
    }
    return;
  }
  if (e.key.length !== 1) return;
  if (State.authFocus === "username") {
    State.authUsername += e.key;
  } else {
    State.authPassword += e.key;
  }
}

function handleTap(x, y) {
  if (State.screen === "auth") {
    handleAuthTap(x, y);
  } else if (State.screen === "permission") {
    requestMotionAndStart();
  } else if (State.screen === "calibrate") {
    calibrate();
    startGame();
  } else if (State.screen === "menu") {
    if (hit(x, y, 86, 330, 188, 48)) {
      State.screen = "permission";
    } else if (hit(x, y, 86, 393, 188, 48)) {
      State.screen = "shop";
    } else if (hit(x, y, 86, 456, 188, 40)) {
      State.screen = "slots";
    } else if (hit(x, y, 104, 510, 152, 40)) {
      logoutUser();
    }
  } else if (State.screen === "slots") {
    for (let i = 0; i < 3; i++) {
      const slotY = 140 + i * 140;
      if (State.slots[i]) {
        if (hit(x, y, 50, slotY + 112, 130, 34)) {
          selectSlot(i);
          State.screen = "menu";
        } else if (hit(x, y, 185, slotY + 112, 130, 34)) {
          State.pendingSlotIdx = i;
          State.screen = "cmsetup";
        }
      } else {
        if (hit(x, y, 50, slotY + 112, 130, 34)) {
          createNewSlot(i);
          State.screen = "menu";
        } else if (hit(x, y, 185, slotY + 112, 130, 34)) {
          State.pendingSlotIdx = i;
          State.screen = "cmsetup";
        }
      }
    }
    if (hit(x, y, 104, 570, 152, 40)) {
      State.screen = "menu";
    }
  } else if (State.screen === "customselect") {
    if (hit(x, y, 10, 150, 155, 75)) {
      State.customMode.enabled = false;
      State.screen = "cmsetup";
    } else if (hit(x, y, 195, 150, 155, 75)) {
      State.customMode.enabled = true;
      State.screen = "cmsetup";
    } else if (hit(x, y, 104, 545, 152, 40)) {
      State.screen = "slots";
    }
  } else if (State.screen === "cmsetup") {
    const cm = State.customMode;
    const ce = State.customEdit;
    if (hit(x, y, 30, 175, 60, 30)) { cm.chickens = Math.max(3, cm.chickens - 1); Audio.beep("pet"); }
    else if (hit(x, y, 90, 175, 60, 30)) { cm.chickens++; Audio.beep("pet"); }
    else if (hit(x, y, 155, 175, 60, 30)) { cm.chickens = Math.min(9, cm.chickens + 1); Audio.beep("pet"); }
    else if (hit(x, y, 220, 175, 60, 30)) { cm.chickens = Math.max(3, cm.chickens - 1); Audio.beep("pet"); }
    else if (hit(x, y, 30, 255, 60, 30)) { cm.coins = Math.max(0, cm.coins - 50); Audio.beep("pet"); }
    else if (hit(x, y, 90, 255, 60, 30)) { cm.coins = Math.max(0, cm.coins - 10); Audio.beep("pet"); }
    else if (hit(x, y, 150, 255, 60, 30)) { cm.coins += 10; Audio.beep("pet"); }
    else if (hit(x, y, 210, 255, 60, 30)) { cm.coins += 50; Audio.beep("pet"); }
    else if (hit(x, y, 30, 335, 60, 30)) { cm.hay = Math.max(1, cm.hay - 50); Audio.beep("pet"); }
    else if (hit(x, y, 90, 335, 60, 30)) { cm.hay = Math.max(1, cm.hay - 10); Audio.beep("pet"); }
    else if (hit(x, y, 150, 335, 60, 30)) { cm.hay += 10; Audio.beep("pet"); }
    else if (hit(x, y, 210, 335, 60, 30)) { cm.hay += 50; Audio.beep("pet"); }
    else if (hit(x, y, 56, 415, 248, 50)) {
      if (State.pendingSlotIdx !== null) {
        createCustomSlot(State.pendingSlotIdx, State.customMode);
        State.pendingSlotIdx = null;
      }
      State.screen = "slots";
    } else if (hit(x, y, 104, 485, 152, 40)) {
      State.screen = "slots";
    }
  } else if (State.screen === "shop") {
    if (hit(x, y, 50, 330, 260, 50)) {
      if (State.save.coins >= 5) {
        State.save.coins -= 5;
        State.save.hayStorage += 1;
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
    } else if (State.shopOverlay) {
      if (hit(x, y, 50, 158, 200, 38)) {
        if (State.save.coins >= 5) {
          State.save.coins -= 5;
          State.save.hayStorage += 1;
          saveGame();
          Audio.beep("pet");
        } else Audio.beep("miss");
      } else if (hit(x, y, 50, 256, 200, 32) && !State.save.heatLamp) {
        if (State.save.coins >= 500) {
          State.save.coins -= 500;
          State.save.heatLamp = true;
          saveGame();
          Audio.beep("win");
        } else Audio.beep("miss");
      } else if (hit(x, y, 200, 340, 100, 36)) {
        buyChicken("yellow");
      } else if (hit(x, y, 200, 412, 100, 36)) {
        buyChicken("white");
      } else if (hit(x, y, 200, 484, 100, 36)) {
        buyChicken("brown");
      } else if (hit(x, y, 104, 555, 152, 40)) {
        State.shopOverlay = false;
      }
    } else if (State.statusPanel) {
      State.statusPanel = false;
    } else if (hit(x, y, 10, 584, 52, 34)) {
      State.paused = true;
    } else if (hit(x, y, 66, 584, 52, 34)) {
      State.shopOverlay = true;
    } else if (hit(x, y, 122, 584, 52, 34)) {
      State.statusPanel = true;
    } else if (hit(x, y, 178, 584, 52, 34)) {
      saveSlot(State.currentSlot);
      saveGame();
      State.toast = "已保存";
      State.toastTimer = 1.5;
      Audio.beep("win");
    } else if (hit(x, y, 234, 584, 52, 34)) {
      endGame(false);
    } else if (hit(x, y, 290, 584, 60, 34)) {
      saveAndQuit();
    } else {
      interact(x, y);
    }
  } else if (State.screen === "nextday") {
    if (hit(x, y, 86, 440, 188, 48)) {
      startGame();
    } else if (hit(x, y, 104, 506, 152, 40)) {
      State.screen = "menu";
    }
  } else if (State.screen === "result") {
    if (hit(x, y, 86, 385, 188, 48)) startGame();
    else if (hit(x, y, 104, 445, 152, 40)) State.screen = "menu";
  }
}