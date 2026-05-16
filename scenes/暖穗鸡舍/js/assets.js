"use strict";

const Assets = {
  loaded: false,
  imgs: {},
  frames: {
    idle: ["idle_011", "idle_012"],
    happy: ["happy_017","happy_018","happy_019","happy_020","happy_021","happy_022","happy_023","happy_024","happy_025","happy_026","happy_027","happy_028","happy_029","happy_030","happy_031","happy_032","happy_033","happy_034","happy_035","happy_036","happy_037","happy_038","happy_039"],
    peck: ["peck_040","peck_041","peck_042","peck_043","peck_044","peck_045","peck_046","peck_047","peck_048","peck_049","peck_050","peck_051","peck_052","peck_053","peck_054","peck_055","peck_056","peck_057","peck_058","peck_059","peck_060","peck_061","peck_062","peck_063"],
    dir: ["方向图_000","方向图_001","方向图_002","方向图_003","方向图_004","方向图_005"]
  },
  load() {
    const list = [
      "chicken_white", "chicken_brown", "chicken_yellow",
      "egg_normal", "egg_silver", "egg_gold", "egg_rare",
      "hopper", "trough_empty", "trough_filled"
    ];
    Object.values(Assets.frames).forEach(arr => arr.forEach(name => list.push(`小鸡状态图/${name}`)));
    let count = 0;
    return new Promise(resolve => {
      list.forEach(name => {
        const img = new Image();
        img.onload = () => {
          count++;
          if (count === list.length) {
            Assets.loaded = true;
            resolve();
          }
        };
        img.onerror = () => {
          console.warn(`Failed to load ${name}`);
          count++;
          if (count === list.length) {
            Assets.loaded = true;
            resolve();
          }
        };
        img.src = `assets/${name}.png`;
        Assets.imgs[name] = img;
      });
    });
  }
};

const Audio = {
  ctx: null,
  ensure() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) this.ctx = new AC();
    }
    if (this.ctx && this.ctx.state === "suspended") this.ctx.resume();
  },
  beep(type) {
    try {
      this.ensure();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const map = {
        hay: [360, 0.07, "triangle"],
        place: [260, 0.09, "sine"],
        pet: [620, 0.12, "sine"],
        egg: [780, 0.08, "triangle"],
        miss: [150, 0.04, "sawtooth"],
        win: [520, 0.22, "sine"]
      };
      const [freq, dur, wave] = map[type] || map.miss;
      osc.type = wave;
      osc.frequency.setValueAtTime(freq, now);
      if (type === "win") osc.frequency.exponentialRampToValueAtTime(880, now + dur);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.08, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + dur + 0.02);
    } catch (_) {}
  }
};