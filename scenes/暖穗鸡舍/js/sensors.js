"use strict";

function onOrientation(e) {
  State.orientation.alpha = e.alpha || 0;
  State.orientation.beta = e.beta || 0;
  State.orientation.gamma = e.gamma || 0;
  State.orientation.has = true;
  if (State.sensorReady) State.sensorMode = "gyro";
}

function updateLook() {
  if (State.sensorMode === "gyro" && State.orientation.has && !State.desktopSim) {
    State.targetLook.yaw = normDeg(State.orientation.alpha - State.calibration.alpha + State.drag.yaw);
    State.targetLook.pitch = clamp((State.orientation.beta - State.calibration.beta) * 0.7 + State.drag.pitch, -Config.pitchRange, Config.pitchRange);
  } else {
    State.targetLook.yaw = normDeg(State.drag.yaw);
    State.targetLook.pitch = clamp(State.drag.pitch, -Config.pitchRange, Config.pitchRange);
  }
  State.look.yaw = normDeg(State.look.yaw + normDeg(State.targetLook.yaw - State.look.yaw) * Config.yawSmoothing);
  State.look.pitch += (State.targetLook.pitch - State.look.pitch) * Config.pitchSmoothing;
}

function calibrate() {
  State.calibration.alpha = State.orientation.has ? State.orientation.alpha : 0;
  State.calibration.beta = State.orientation.has ? State.orientation.beta : 70;
  State.drag.yaw = 0;
  State.drag.pitch = 0;
  State.targetLook.yaw = 0;
  State.targetLook.pitch = 0;
  State.look.yaw = 0;
  State.look.pitch = 0;
}

async function requestMotionAndStart() {
  try {
    Audio.ensure();
    State.permissionAsked = true;
    const DOE = window.DeviceOrientationEvent;
    if (DOE && typeof DOE.requestPermission === "function") {
      const res = await DOE.requestPermission();
      if (res === "granted") {
        State.sensorMode = "gyro";
        State.sensorReady = true;
      } else {
        State.sensorMode = "drag";
        State.toast = "已切换为拖动视角";
        State.toastTimer = 2;
      }
    } else if (DOE) {
      State.sensorMode = "gyro";
      State.sensorReady = true;
    } else {
      State.sensorMode = "drag";
      State.desktopSim = true;
    }
    State.screen = "calibrate";
  } catch (_) {
    State.sensorMode = "drag";
    State.desktopSim = true;
    State.screen = "calibrate";
  }
}