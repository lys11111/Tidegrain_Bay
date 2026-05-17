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
    if (State.lastAlpha !== null) {
      let deltaAlpha = State.orientation.alpha - State.lastAlpha;
      if (deltaAlpha > 180) deltaAlpha -= 360;
      if (deltaAlpha < -180) deltaAlpha += 360;
      State.gyroAccumulatedYaw += deltaAlpha;
    }
    State.lastAlpha = State.orientation.alpha;

    const yawDelta = State.orientation.gamma - State.calibration.gamma;
    State.targetLook.yaw = State.gyroAccumulatedYaw - yawDelta;
    State.targetLook.pitch = clamp(
      (State.orientation.beta - State.calibration.beta) * 0.7 + State.drag.pitch,
      -Config.pitchRange, Config.pitchRange
    );
  } else {
    State.targetLook.yaw = normDeg(State.drag.yaw);
    State.targetLook.pitch = clamp(State.drag.pitch, -Config.pitchRange, Config.pitchRange);
  }

  const rawDiff = State.targetLook.yaw - State.look.yaw;
  State.look.yaw = normDeg(State.look.yaw + rawDiff * Config.yawSmoothing);
  State.look.pitch += (State.targetLook.pitch - State.look.pitch) * Config.pitchSmoothing;
}

function calibrate() {
  State.calibration.alpha = State.orientation.has ? State.orientation.alpha : 0;
  State.calibration.beta = State.orientation.has ? State.orientation.beta : 70;
  State.calibration.gamma = State.orientation.has ? State.orientation.gamma : 0;
  State.gyroBaseAlpha = State.orientation.has ? State.orientation.alpha : 0;
  State.gyroAccumulatedYaw = 0;
  State.lastAlpha = null;
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