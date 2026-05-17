# 晨光小鸡舍 (Tidegrain Bay) 游戏机制 & UI/UX 设计文档

> 用于其他Agent参考构建类似项目

## 项目概述

| 属性 | 值 |
|------|-----|
| 游戏类型 | 俯视角鸡舍模拟经营游戏 |
| 核心玩法 | 90秒内完成喂食、抚摸、拾蛋任务，追求S级评分 |
| 目标平台 | 手机 + PC 浏览器 |
| 技术栈 | HTML5 + CSS3 + JavaScript + Three.js (3D渲染) |
| 分辨率 | 360x640 (移动端优化) |
| 存储 | localStorage |

---

## 一、游戏架构

### 1.1 项目目录结构

```
project/
├── index.html              # 入口HTML
├── css/
│   └── style.css           # 所有样式
└── js/
    ├── main.js             # 主循环 (requestAnimationFrame)
    ├── config.js           # 常量配置
    ├── state.js            # 全局状态 (唯一数据源)
    ├── game-logic.js       # 游戏逻辑核心
    ├── screens.js          # 屏幕渲染 (HTML覆盖层)
    ├── ui.js               # UI组件 (按钮/进度条等)
    ├── input.js            # 鼠标/触摸输入处理
    ├── sensors.js         # 陀螺仪/设备方向
    ├── persistence.js     # 存档加载/保存
    ├── auth.js             # 账号系统
    ├── math.js             # 坐标投影/向量计算
    ├── assets.js           # 资源加载
    ├── render-bg.js        # 背景渲染
    ├── render-objects.js   # 3D物品渲染
    └── particles.js        # 粒子效果系统
```

### 1.2 模块职责

| 模块 | 职责 | 关键API |
|------|------|---------|
| `state.js` | 全局状态管理 | `State`, `loadSave()`, `saveSave()` |
| `game-logic.js` | 游戏逻辑 | `startGame()`, `interact()`, `endGame()` |
| `main.js` | 主循环/初始化 | `gameLoop()`, `init()` |
| `screens.js` | 屏幕切换 | `showScreen()`, `screenUpdate()` |
| `input.js` | 输入处理 | `onPointerDown()`, `onPointerMove()` |

### 1.3 屏幕流转

```
boot → auth → slots → menu
                  ↓
            permission → calibrate → playing
                  ↓              ↓
            shop ← ← ← ← ← ← ← ← ┘
                  ↓
              nextday → menu
```

**屏幕类型:**
- `boot` - 资源加载
- `auth` - 登录/注册
- `slots` - 存档选择
- `menu` - 主菜单
- `permission` - 权限申请(陀螺仪)
- `calibrate` - 陀螺仪校准
- `playing` - 游戏进行中
- `nextday` - 结算画面

---

## 二、游戏机制

### 2.1 核心循环（每日任务）

玩家在90秒倒计时内完成以下任务：

| 任务类型 | 目标数量 | 完成效果 |
|---------|---------|---------|
| 喂干草 | 填充所有食槽 | 小鸡好感+8 |
| 摸摸鸡 | 抚摸所有小鸡 | 小鸡好感+15 + 心形粒子 |
| 拾鸡蛋 | 拾取所有鸡蛋 | 获得金币奖励 |

### 2.2 评级系统

| 评级 | 条件 |
|------|------|
| S级 | 完成全部8项任务 + 用时≥35秒 |
| A级 | 完成全部8项任务 |
| B级 | 完成≥6项任务 |
| C级 | 完成≥3项任务 |
| D级 | 完成<3项任务 |

### 2.3 小鸡系统

**小鸡品质:**
```javascript
CHICKEN_TIERS = {
  yellow: { name: "小黄", color: "#ffd85e", price: 200 },
  white:  { name: "银羽", color: "#fff6d7", price: 400 },
  brown:  { name: "金栗", color: "#c98242", price: 600 }
}
```

**好感度系统:**
- 范围: 0-1000
- 每200点 = 1颗心（显示上限5颗）
- 摸头 +15好感，喂食 +8好感

**鸡蛋品质概率:**
```
bonus = tierBonus(0~0.22) + friendBonus(0~0.5) + heatBonus(0.12)

稀有蛋: bonus * 0.45  (价值100金币)
金星蛋: bonus * 0.70  (价值50金币)
银星蛋: bonus * 0.90  (价值20金币)
普通蛋: 剩余概率     (价值10金币)
```

### 2.4 交互流程

```
点击3D场景 → findObjectAtScreen(tx,ty) → 获取目标物体
                                        ↓
                          ┌─────────────┴─────────────┐
                          ↓                           ↓
                    手持干草?                      手持空?
                          ↓                           ↓
              点击食槽→放干草                 点击料斗→拿干草
                          ↓                           ↓
                    小鸡跑来吃                     状态更新
                          ↓                           ↓
                    任务完成                       HUD更新
```

**交互优先级:**
1. 如果持有干草且点击空食槽 → 放干草
2. 如果没持有且点击料斗 → 拿干草
3. 如果点击小鸡 → 抚摸
4. 如果点击鸡蛋 → 拾取

---

## 三、UI/UX设计

### 3.1 HUD布局 (360x640)

```
┌────────────────────────────────────┐
│ [干草 0/3] [摸摸 0/3] [鸡蛋 0/2]   │  ← 顶部任务栏 (10, 10)
│ [料斗 3]    ○○○       [90s]       │  ← 底部物品栏 (186, 74)
│                                    │
│           [指引箭头]               │  ← 动态指引 (超出视野时)
│                                    │
│                                    │
│        3D 鸡舍场景                  │  ← Three.js Canvas
│     (小鸡/料斗/鸡蛋)               │
│                                    │
│                                    │
│ [暂停][商店][状态][保存][结束][退出] │  ← 底部控制栏 (10, 584)
└────────────────────────────────────┘
```

### 3.2 屏幕层级

```
┌────────────────────────────────────┐
│           3D Canvas                │  ← 底层: Three.js渲染
├────────────────────────────────────┤
│           HTML Overlay             │  ← 中层: 游戏HUD
├────────────────────────────────────┤
│         Modal/Panel               │  ← 顶层: 暂停/商店/结算
└────────────────────────────────────┘
```

### 3.3 视觉规范

| 属性 | 值 |
|------|-----|
| 主色 | `#2e241d` (深棕色背景) |
| 强调色 | `#fcd264` (金色高亮) |
| 成功色 | `#4ade80` (绿色) |
| 错误色 | `#f87171` (红色) |
| 文字色 | `#fef3c7` (米黄) |
| 圆角 | 12px (按钮), 16px (面板) |
| 投影 | `0 4px 20px rgba(0,0,0,0.3)` |

### 3.4 粒子效果

| 效果 | 触发 | 表现 |
|------|------|------|
| 心形 ♥ | 抚摸小鸡 | 5-8个粉心向上飘散 |
| 闪光 ✨ | 拾取鸡蛋 | 金色光点向外扩散 |
| 浮动文字 | 获得金币 | "+10" 向上飘动消失 |

### 3.5 动画状态

| 状态 | 适用对象 | 表现 |
|------|---------|------|
| `idle` | 小鸡 | 轻微上下浮动 (sin波) |
| `walk` | 小鸡 | 位移到食槽/离开 |
| `peck` | 小鸡 | 低头啄食 |
| `happy` | 小鸡 | 抚摸后开心抖动 |
| `spin` | 鸡蛋 | 缓慢旋转 |

---

## 四、数据结构

### 4.1 全局State对象

```javascript
// state.js
const State = {
  // === 运行时不序列化 ===
  screen: "boot",           // 当前屏幕
  holding: null,            // 手持物品 ("hay" | null)
  hayLeft: 3,               // 料斗剩余干草
  feedPlaced: 0,            // 已放干草数
  eggsCollected: 0,         // 已拾取鸡蛋数
  petsDone: 0,              // 已摸鸡数
  timeLeft: 90,             // 剩余秒数
  paused: false,            // 暂停标志
  shopOverlay: false,       // 商店叠加层
  statusPanel: false,       // 状态面板

  // === 存档数据 (persistence.js) ===
  save: {
    days: 0,                // 游玩天数
    eggs: 0,                // 累计获得鸡蛋
    coins: 0,               // 金币余额
    bestClear: 0,           // 最佳通关时间(秒)
    perfectDays: 0,         // 完美通关天数

    // 小鸡数据: { [chickenId]: { tier, friendship, hunger } }
    friendship: {},
    chickenHunger: {},
    ownedChickens: {},

    // 鸡蛋统计
    eggQuality: {
      normal: 0,
      silver: 0,
      gold: 0,
      rare: 0
    },

    // 物品
    hayStorage: 10,         // 仓库干草
    heatLamp: false,         // 保温灯

    // 系统
    users: {},               // 账号: { username: password }
    slots: []                // 存档槽: [{ days, coins, chickens... }]
  }
};
```

### 4.2 存档键名

```javascript
// persistence.js
const SAVE_KEY = "morning-coop-save-v1";
const MAX_SLOTS = 3;
```

### 4.3 3D物体数据结构

```javascript
// render-objects.js
const objects = {
  hopper: { pos: vec3(0, 0, -2), radius: 0.8 },
  troughs: [
    { pos: vec3(-1.5, 0, -1), filled: false },
    { pos: vec3(0, 0, -1), filled: false },
    { pos: vec3(1.5, 0, -1), filled: false }
  ],
  chickens: [
    { id: "chicken_1", pos: vec3(...), tier: "yellow" },
    // ...
  ],
  eggs: [
    { id: "egg_1", pos: vec3(...), quality: "normal" }
  ]
};
```

---

## 五、核心函数参考

### 5.1 游戏逻辑

```javascript
// game-logic.js

/**
 * 开始新游戏
 */
function startGame() {
  State.screen = "playing";
  State.timeLeft = 90;
  State.holding = null;
  State.hayLeft = 3;
  State.feedPlaced = 0;
  State.eggsCollected = 0;
  State.petsDone = 0;
  // 初始化小鸡位置、鸡蛋等
}

/**
 * 处理点击交互
 * @param {number} screenX - 屏幕X坐标
 * @param {number} screenY - 屏幕Y坐标
 */
function interact(screenX, screenY) {
  const obj = findObjectAtScreen(screenX, screenY);
  if (!obj) return;

  if (State.holding === "hay" && obj.type === "trough" && !obj.filled) {
    // 放干草
    State.holding = null;
    obj.filled = true;
    State.feedPlaced++;
    spawnParticles("hay", obj.pos);
  } else if (State.holding === null && obj.type === "hopper") {
    // 拿干草
    State.holding = "hay";
    State.hayLeft--;
  } else if (obj.type === "chicken") {
    // 摸鸡
    State.petsDone++;
    State.save.friendship[obj.id] += 15;
    spawnParticles("heart", obj.pos);
  } else if (obj.type === "egg") {
    // 拾蛋
    const value = EGG_VALUES[obj.quality];
    State.save.coins += value;
    State.eggsCollected++;
    removeObject(obj.id);
    spawnParticles("sparkle", obj.pos);
  }
}

/**
 * 结束游戏
 * @param {boolean} auto - 是否超时自动结束
 */
function endGame(auto) {
  State.paused = true;
  const score = calculateScore();
  showScreen("nextday");
}
```

### 5.2 屏幕渲染

```javascript
// screens.js

const screens = {
  boot: () => { /* 加载资源 */ },
  auth: () => { /* 登录界面 */ },
  menu: () => { /* 主菜单 */ },
  playing: () => { /* 游戏HUD */ },
  nextday: () => { /* 结算 */ }
};

function showScreen(name) {
  // 隐藏所有屏幕
  document.querySelectorAll('.screen').forEach(s => s.style.display = 'none');
  // 显示目标屏幕
  if (screens[name]) screens[name]();
  State.screen = name;
}
```

### 5.3 坐标投影

```javascript
// math.js

/**
 * 3D坐标转屏幕坐标
 * @param {vec3} pos - 3D位置
 * @returns {vec2} 屏幕坐标
 */
function project(pos) {
  const vec = new THREE.Vector3(pos.x, pos.y, pos.z);
  vec.project(camera);
  return {
    x: (vec.x + 1) / 2 * canvas.width,
    y: (-vec.y + 1) / 2 * canvas.height
  };
}

/**
 * 屏幕坐标转3D射线
 */
function screenToRay(screenX, screenY) {
  const mouse = new THREE.Vector2(
    (screenX / canvas.width) * 2 - 1,
    -(screenY / canvas.height) * 2 + 1
  );
  raycaster.setFromCamera(mouse, camera);
  return raycaster.ray;
}
```

---

## 六、输入系统

### 6.1 视角控制

```javascript
// sensors.js

let yaw = 0;      // 水平角度
let pitch = 0;    // 垂直角度

function updateLook(yawDelta, pitchDelta) {
  yaw += yawDelta * 0.1;
  pitch = clamp(pitch + pitchDelta * 0.1, -55, 55);
  camera.rotation.set(pitch * DEG2RAD, yaw * DEG2RAD, 0);
}
```

### 6.2 触摸/鼠标处理

```javascript
// input.js

canvas.addEventListener('pointerdown', (e) => {
  if (State.screen !== 'playing' || State.paused) return;
  interact(e.clientX, e.clientY);
});

let isDragging = false;
let lastX, lastY;

canvas.addEventListener('pointermove', (e) => {
  if (!isDragging) return;
  const deltaX = e.clientX - lastX;
  const deltaY = e.clientY - lastY;
  updateLook(deltaX, deltaY);
  lastX = e.clientX;
  lastY = e.clientY;
});
```

---

## 七、存档系统

```javascript
// persistence.js

function loadSave() {
  try {
    const data = localStorage.getItem(SAVE_KEY);
    if (data) {
      State.save = JSON.parse(data);
    }
  } catch (e) {
    console.warn('存档加载失败', e);
  }
}

function saveSave() {
  try {
    // 只保存save对象,不保存运行时状态
    const { screen, holding, ...runtime } = State;
    localStorage.setItem(SAVE_KEY, JSON.stringify(State.save));
  } catch (e) {
    console.warn('存档保存失败', e);
  }
}
```

---

## 八、代码规范

### 8.1 文件组织

- 每个模块一个文件,集中管理相关功能
- 避免跨文件相互调用,通過State中转
- 屏幕渲染用HTML/CSS,不用Canvas

### 8.2 命名约定

| 类型 | 约定 | 示例 |
|------|------|------|
| 变量 | 小驼峰 | `hayLeft`, `feedPlaced` |
| 常量 | 全大写下划线 | `MAX_SLOTS`, `EGG_VALUES` |
| 函数 | 小驼峰 | `startGame()`, `interact()` |
| DOM类 | 中划线 | `screen-boot`, `btn-start` |
| CSS类 | 小驼峰 | `taskBar`, `controlPanel` |

### 8.3 性能优化

- 使用 `requestAnimationFrame` 而不是 `setInterval`
- 粒子池复用,避免频繁创建/销毁
- 3D物体不随视角更新,只在交互时检查
- 存档只在必要时保存(退出/切换槽)

---

## 九、构建清单

新建项目时按以下顺序实现:

1. **基础结构** - `index.html`, `css/style.css`, 基础JS框架
2. **状态管理** - `state.js` 全局State对象
3. **屏幕系统** - `screens.js` 屏幕切换
4. **3D渲染** - Three.js场景搭建,物体渲染
5. **输入处理** - `input.js` 点击/拖动
6. **游戏逻辑** - `game-logic.js` 交互核心
7. **UI组件** - `ui.js` HUD元素
8. **陀螺仪** - `sensors.js` 设备方向
9. **存档** - `persistence.js` localStorage
10. **粒子效果** - `particles.js`

---

## 十、调试技巧

```javascript
// 快速重置游戏
function resetGame() {
  localStorage.clear();
  location.reload();
}

// 查看当前状态
function dumpState() {
  console.log(JSON.stringify(State, null, 2));
}

// 跳过教程直接进入游戏
function quickStart() {
  loadSave();
  showScreen('playing');
  startGame();
}
```

---

## 附录: 完整文件列表

```
/scenes/暖穗鸡舍/
├── index.html              # 入口 (含Three.js CDN)
├── css/
│   └── style.css           # 全部样式 (~500行)
└── js/
    ├── main.js             # 主循环 (~100行)
    ├── config.js           # 常量 (~50行)
    ├── state.js            # 状态 (~80行)
    ├── game-logic.js       # 游戏逻辑 (~300行)
    ├── screens.js          # 屏幕 (~400行)
    ├── ui.js               # UI组件 (~200行)
    ├── input.js            # 输入 (~100行)
    ├── sensors.js          # 陀螺仪 (~100行)
    ├── persistence.js      # 存档 (~100行)
    ├── auth.js             # 账号 (~100行)
    ├── math.js             # 数学 (~80行)
    ├── assets.js           # 资源 (~60行)
    ├── render-bg.js        # 背景 (~80行)
    ├── render-objects.js   # 物品 (~200行)
    └── particles.js        # 粒子 (~150行)
```