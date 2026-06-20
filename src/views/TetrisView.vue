<template>
  <!-- 一体化全屏：所有元素整合在同一画布内，无外层大圆角框 -->
  <div class="game-screen">
    <!-- 顶部：返回 + 标题 + 暂停/重开 -->
    <div class="top-bar">
      <button class="icon-btn" @click="$router.back()" aria-label="返回">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <h1 class="title">俄罗斯方块</h1>
      <div class="top-actions">
        <button class="icon-btn" @click="togglePause" :title="paused ? '继续' : '暂停'">
          <svg v-if="!paused && !gameOver" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
          <svg v-else viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="6 4 20 12 6 20 6 4"/></svg>
        </button>
        <button class="icon-btn" @click="restart" title="重新开始">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
        </button>
      </div>
    </div>

    <!-- 计分区：横向 3 块计分 + 1 块"下一个"（缩小） -->
    <div class="stat-bar">
      <div class="stat-chip">
        <span class="chip-label">分数</span>
        <span class="chip-value">{{ score }}</span>
      </div>
      <div class="stat-chip">
        <span class="chip-label">等级</span>
        <span class="chip-value">{{ level }}</span>
      </div>
      <div class="stat-chip">
        <span class="chip-label">消除</span>
        <span class="chip-value">{{ lines }}</span>
      </div>
      <div class="stat-chip stat-next">
        <span class="chip-label">下一块</span>
        <div class="next-mini">
          <div
            v-for="(p, i) in nextPreviewCells"
            :key="'next-' + i"
            class="mini-cell"
            :class="{ show: p.cx >= 0 && p.cx < 4 && p.cy >= 0 && p.cy < 2 }"
            :style="{ background: nextColor }"
          />
        </div>
      </div>
    </div>

    <!-- 游戏画布：居中铺满，可缩放适配屏幕 -->
    <div class="board-area">
      <div class="board">
        <!-- 已落定方块 -->
        <div
          v-for="cell in fixedCells"
          :key="cell.k"
          class="cell fixed"
          :style="cellStyle(cell.x, cell.y, cell.color)"
        />
        <!-- 当前方块 -->
        <template v-if="current && !gameOver">
          <div
            v-for="(p, i) in currentCells"
            :key="'cur-' + i"
            class="cell current"
            :style="cellStyle(p.x, p.y, current.color)"
          />
        </template>
        <!-- 影子（预测落点） -->
        <template v-if="ghostCells.length && current">
          <div
            v-for="(p, i) in ghostCells"
            :key="'ghost-' + i"
            class="cell ghost"
            :style="cellStyle(p.x, p.y, current.color)"
          />
        </template>

        <!-- 暂停遮罩 -->
        <div v-if="paused && !gameOver" class="overlay">
          <div class="overlay-inner">
            <p class="overlay-title">⏸ 暂停中</p>
            <p class="overlay-sub">按 P 或点击顶部播放键继续</p>
          </div>
        </div>
        <!-- 开始遮罩 -->
        <div v-if="!started && !gameOver" class="overlay">
          <div class="overlay-inner">
            <p class="overlay-title">🎮 俄罗斯方块</p>
            <p class="overlay-sub">点击「开始」挑战</p>
            <button class="overlay-btn" @click="startGame">开始游戏</button>
          </div>
        </div>
        <!-- 结束遮罩 -->
        <div v-if="gameOver" class="overlay">
          <div class="overlay-inner">
            <p class="overlay-title">💀 游戏结束</p>
            <p class="overlay-sub">最终得分：<b>{{ score }}</b> · 等级 {{ level }} · 消除 {{ lines }} 行</p>
            <button class="overlay-btn" @click="restart">再来一局</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 移动端控制：贴合画布底部，一体化
         布局：上排 左移/软降/右移；下排 重开/硬降/旋转(独立大) -->
    <div class="mobile-pad">
      <div class="pad-row pad-row-top">
        <button class="pad-btn" @click="move(-1)" aria-label="左移">←</button>
        <button class="pad-btn pad-down" @click="softDrop" aria-label="软降">↓</button>
        <button class="pad-btn" @click="move(1)" aria-label="右移">→</button>
      </div>
      <div class="pad-row pad-row-bottom">
        <button class="pad-btn pad-restart" @click="restart" aria-label="重开">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
        </button>
        <button class="pad-btn pad-hard" @click="hardDrop" aria-label="硬降">⤓ 硬降</button>
        <button class="pad-btn pad-rotate" @click="rotate" aria-label="旋转">
          <span class="rot-icon">↻</span>
        </button>
      </div>
    </div>

    <!-- 操作说明：底部一行浅灰小字 -->
    <p class="help-bar">
      <span><span class="kbd">← →</span>移动</span>
      <span><span class="kbd">↑</span>旋转</span>
      <span><span class="kbd">↓</span>软降</span>
      <span><span class="kbd">␣</span>硬降</span>
      <span><span class="kbd">P</span>暂停</span>
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, onActivated, onDeactivated } from 'vue'

/* ===== 基础常量 ===== */
const COLS = 10
const ROWS = 20
const CELL = 28

/* ===== 方块定义（7 种，SRS 旋转状态） ===== */
type TetrominoKey = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L'

const SHAPES: Record<TetrominoKey, number[][][]> = {
  I: [
    [[0,1],[1,1],[2,1],[3,1]],
    [[2,0],[2,1],[2,2],[2,3]],
    [[0,2],[1,2],[2,2],[3,2]],
    [[1,0],[1,1],[1,2],[1,3]],
  ],
  O: [
    [[1,0],[2,0],[1,1],[2,1]],
    [[1,0],[2,0],[1,1],[2,1]],
    [[1,0],[2,0],[1,1],[2,1]],
    [[1,0],[2,0],[1,1],[2,1]],
  ],
  T: [
    [[1,0],[0,1],[1,1],[2,1]],
    [[1,0],[1,1],[2,1],[1,2]],
    [[0,1],[1,1],[2,1],[1,2]],
    [[1,0],[0,1],[1,1],[1,2]],
  ],
  S: [
    [[1,0],[2,0],[0,1],[1,1]],
    [[1,0],[1,1],[2,1],[2,2]],
    [[1,1],[2,1],[0,2],[1,2]],
    [[0,0],[0,1],[1,1],[1,2]],
  ],
  Z: [
    [[0,0],[1,0],[1,1],[2,1]],
    [[2,0],[1,1],[2,1],[1,2]],
    [[0,1],[1,1],[1,2],[2,2]],
    [[1,0],[0,1],[1,1],[0,2]],
  ],
  J: [
    [[0,0],[0,1],[1,1],[2,1]],
    [[1,0],[2,0],[1,1],[1,2]],
    [[0,1],[1,1],[2,1],[2,2]],
    [[1,0],[1,1],[0,2],[1,2]],
  ],
  L: [
    [[2,0],[0,1],[1,1],[2,1]],
    [[1,0],[1,1],[1,2],[2,2]],
    [[0,1],[1,1],[2,1],[0,2]],
    [[0,0],[1,0],[1,1],[1,2]],
  ],
}

const COLORS: Record<TetrominoKey, string> = {
  I: '#5AC8FA',
  O: '#FFD45C',
  T: '#B48AFF',
  S: '#5CD890',
  Z: '#FF6B6B',
  J: '#4D8DFF',
  L: '#FFA042',
}

type Piece = { key: TetrominoKey; rot: 0|1|2|3; x: number; y: number; color: string }

function makePiece(key: TetrominoKey): Piece {
  return { key, rot: 0, x: 3, y: 0, color: COLORS[key] }
}

function pieceCells(p: Piece): [number, number][] {
  return SHAPES[p.key][p.rot].map(([cx, cy]) => [p.x + cx, p.y + cy])
}

/* ===== 状态 ===== */
const board = ref<(string | null)[][]>(
  Array.from({ length: ROWS }, () => Array(COLS).fill(null))
)
const current = ref<Piece | null>(null)
const next = ref<TetrominoKey>('I')
const bag = ref<TetrominoKey[]>([])
const score = ref(0)
const lines = ref(0)
const level = ref(1)
const paused = ref(false)
const gameOver = ref(false)
const started = ref(false)
const tickMs = ref(800)
let tickTimer: number | null = null

/* ===== 画布尺寸（响应式：根据窗口宽度缩放） ===== */
const boardW = computed(() => COLS * CELL)
const boardH = computed(() => ROWS * CELL)

/* ===== 7-bag 随机 ===== */
const ALL_KEYS: TetrominoKey[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L']
function refillBag() {
  const arr = [...ALL_KEYS]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  bag.value.push(...arr)
}
function nextKey(): TetrominoKey {
  if (bag.value.length < 7) refillBag()
  const k = bag.value.shift()!
  return k
}

/* ===== 碰撞检测 ===== */
function collides(p: Piece, b: (string|null)[][] = board.value): boolean {
  for (const [x, y] of pieceCells(p)) {
    if (x < 0 || x >= COLS || y >= ROWS) return true
    if (y >= 0 && b[y][x]) return true
  }
  return false
}

/* ===== 渲染辅助 ===== */
const fixedCells = computed(() => {
  const arr: { k: string; x: number; y: number; color: string }[] = []
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      const c = board.value[y][x]
      if (c) arr.push({ k: `f-${x}-${y}`, x, y, color: c })
    }
  }
  return arr
})

const currentCells = computed(() => {
  if (!current.value) return []
  return pieceCells(current.value)
    .filter(([x, y]) => y >= 0)
    .map(([x, y]) => ({ x, y }))
})

const ghostCells = computed(() => {
  if (!current.value) return []
  let p = { ...current.value }
  while (true) {
    const np: Piece = { ...p, y: p.y + 1 }
    if (collides(np)) break
    p = np
  }
  return pieceCells(p)
    .filter(([x, y]) => y >= 0)
    .map(([x, y]) => ({ x, y }))
})

const nextPreviewCells = computed(() => {
  if (!next.value) return []
  const p = makePiece(next.value)
  return SHAPES[p.key][0].map(([cx, cy]) => ({ cx, cy }))
})
const nextColor = computed(() => COLORS[next.value])

function cellStyle(x: number, y: number, color: string) {
  // 用百分比定位 + 百分比尺寸 → 画布无论自适应到多大，10×20 都精准铺满
  return {
    left: (x * 100 / COLS) + '%',
    top: (y * 100 / ROWS) + '%',
    width: (100 / COLS) + '%',
    height: (100 / ROWS) + '%',
    background: color,
  } as Record<string, string>
}

/* ===== 移动 / 旋转 / 落 ===== */
function move(dx: number) {
  if (!current.value || paused.value || gameOver.value) return
  const np: Piece = { ...current.value, x: current.value.x + dx }
  if (!collides(np)) current.value = np
}
function rotate() {
  if (!current.value || paused.value || gameOver.value) return
  const nextRot = ((current.value.rot + 1) % 4) as 0|1|2|3
  const kicks = [[0,0],[-1,0],[1,0],[0,-1],[-1,-1],[1,-1]]
  for (const [dx, dy] of kicks) {
    const np: Piece = { ...current.value, rot: nextRot, x: current.value.x + dx, y: current.value.y + dy }
    if (!collides(np)) { current.value = np; return }
  }
}
function softDrop() {
  if (!current.value || paused.value || gameOver.value) return
  step()
  score.value += 1
}
function hardDrop() {
  if (!current.value || paused.value || gameOver.value) return
  let dist = 0
  while (true) {
    const np: Piece = { ...current.value!, y: current.value!.y + 1 }
    if (collides(np)) break
    current.value = np
    dist++
  }
  score.value += dist * 2
  lockPiece()
}

/* ===== 锁定 & 消行 ===== */
function lockPiece() {
  if (!current.value) return
  for (const [x, y] of pieceCells(current.value)) {
    if (y < 0) { gameOver.value = true; break }
    board.value[y][x] = current.value.color
  }
  let cleared = 0
  for (let y = ROWS - 1; y >= 0; y--) {
    if (board.value[y].every(c => c !== null)) {
      board.value.splice(y, 1)
      board.value.unshift(Array(COLS).fill(null))
      cleared++
      y++
    }
  }
  if (cleared > 0) {
    const points = [0, 100, 300, 500, 800][cleared] * level.value
    score.value += points
    lines.value += cleared
    const newLevel = Math.floor(lines.value / 10) + 1
    if (newLevel !== level.value) {
      level.value = newLevel
      tickMs.value = Math.max(80, 800 - (level.value - 1) * 60)
      if (!paused.value) restartTick()
    }
  }
  if (!gameOver.value) {
    const k = next.value
    next.value = nextKey()
    current.value = makePiece(k)
    if (collides(current.value)) {
      gameOver.value = true
    }
  } else {
    current.value = null
  }
}

/* ===== 计时器 ===== */
function step() {
  if (!current.value) return
  const np: Piece = { ...current.value, y: current.value.y + 1 }
  if (collides(np)) {
    lockPiece()
  } else {
    current.value = np
  }
}
function startTick() {
  stopTick()
  tickTimer = window.setInterval(() => {
    if (!paused.value && !gameOver.value) step()
  }, tickMs.value)
}
function stopTick() {
  if (tickTimer !== null) { clearInterval(tickTimer); tickTimer = null }
}
function restartTick() {
  stopTick()
  startTick()
}

/* ===== 控盘 ===== */
function onKey(e: KeyboardEvent) {
  if (e.repeat && (e.key === ' ' || e.key === 'ArrowLeft' || e.key === 'ArrowRight')) return
  switch (e.key) {
    case 'ArrowLeft':  move(-1); e.preventDefault(); break
    case 'ArrowRight': move(1); e.preventDefault(); break
    case 'ArrowDown':  softDrop(); e.preventDefault(); break
    case 'ArrowUp':    rotate(); e.preventDefault(); break
    case ' ':          hardDrop(); e.preventDefault(); break
    case 'p': case 'P': togglePause(); break
    case 'r': case 'R': restart(); break
  }
}

/* ===== 生命周期 ===== */
function startGame() {
  if (started.value) return
  started.value = true
  board.value = Array.from({ length: ROWS }, () => Array(COLS).fill(null))
  score.value = 0
  lines.value = 0
  level.value = 1
  tickMs.value = 800
  gameOver.value = false
  paused.value = false
  bag.value = []
  next.value = nextKey()
  current.value = makePiece(nextKey())
  next.value = nextKey()
  startTick()
}
function restart() {
  stopTick()
  started.value = false
  paused.value = false
  gameOver.value = false
  current.value = null
  board.value = Array.from({ length: ROWS }, () => Array(COLS).fill(null))
  score.value = 0
  lines.value = 0
  level.value = 1
  tickMs.value = 800
  setTimeout(startGame, 50)
}
function togglePause() {
  if (!started.value || gameOver.value) return
  paused.value = !paused.value
}
onMounted(() => {
  window.addEventListener('keydown', onKey)
})
onBeforeUnmount(() => {
  stopTick()
  window.removeEventListener('keydown', onKey)
})
// 处理 keep-alive 缓存
onActivated(() => {
  if (started.value && !gameOver.value) startTick()
})
onDeactivated(() => {
  stopTick()
})
</script>

<style scoped>
/* ================================================================
 * 一体化全屏布局：所有元素整合在同一屏，无外层大白色圆角框
 * ================================================================ */
.game-screen {
  min-height: 100vh;
  height: 100vh;
  background: var(--page-bg);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

/* ===== 顶部条（紧凑） ===== */
.top-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px 4px;
  padding-top: max(6px, env(safe-area-inset-top));
  flex-shrink: 0;
}
.title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-h1);
  margin: 0;
  flex: 1;
  text-align: center;
  letter-spacing: 0.02em;
}
.top-actions {
  display: flex;
  gap: 6px;
}
.icon-btn {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--card-bg);
  color: var(--text-body);
  cursor: pointer;
  border: none;
  transition: all 0.15s;
  flex-shrink: 0;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}
.icon-btn:active { transform: scale(0.92); }

/* ===== 计分条（紧凑 4 块） ===== */
.stat-bar {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1.1fr;
  gap: 6px;
  padding: 4px 12px 8px;
  flex-shrink: 0;
}
.stat-chip {
  background: var(--card-bg);
  border-radius: var(--radius-md);
  padding: 5px 6px;
  box-shadow: var(--shadow-soft);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0;
  min-height: 42px;
}
.chip-label {
  font-size: 9px;
  color: var(--text-weak);
  letter-spacing: 0.05em;
  line-height: 1.2;
}
.chip-value {
  font-size: 15px;
  font-weight: 700;
  color: var(--primary);
  line-height: 1.1;
  font-variant-numeric: tabular-nums;
  margin-top: 1px;
}
.stat-next {
  padding: 4px 6px;
}
.next-mini {
  display: grid;
  grid-template-columns: repeat(4, 7px);
  grid-template-rows: repeat(2, 7px);
  gap: 1px;
  margin-top: 2px;
}
.mini-cell {
  width: 7px;
  height: 7px;
  border-radius: 1.5px;
  background: transparent;
  box-shadow: none;
  transition: background 0.15s;
}
.mini-cell.show {
  box-shadow: inset 0 0 0 0.5px rgba(255,255,255,0.18), inset 0 -1px 2px rgba(0,0,0,0.18);
}

/* ===== 游戏画布区（拉高，完整可见 20 行） ===== */
.board-area {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px 12px 6px;
  overflow: hidden;
  min-height: 0;
}
.board {
  position: relative;
  background: rgba(0, 0, 0, 0.035);
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow:
    inset 0 0 0 1px var(--divider),
    0 4px 14px rgba(0, 0, 0, 0.05);
  /* 保持 10:20 长宽比；高度 100% 父容器，不超过最大比例 */
  aspect-ratio: 10 / 20;
  max-width: 100%;
  max-height: 100%;
  height: 100%;
  width: auto;
}

.cell {
  position: absolute;
  border-radius: 3px;
  box-shadow: inset 0 0 0 1px rgba(255,255,255,0.22), inset 0 -3px 4px rgba(0,0,0,0.18);
  transition: top 0.05s linear;
}
.cell.ghost {
  opacity: 0.16;
  box-shadow: none;
  background: var(--primary) !important;
}

/* ===== 遮罩 ===== */
.overlay {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.82);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 5;
}
.overlay-inner {
  text-align: center;
  padding: 0 16px;
}
.overlay-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-h1);
  margin: 0 0 6px;
}
.overlay-sub {
  font-size: 12px;
  color: var(--text-weak);
  margin: 0 0 10px;
}
.overlay-btn {
  background: var(--primary);
  color: #fff;
  border: none;
  border-radius: var(--radius-md);
  padding: 8px 22px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.15s;
}
.overlay-btn:active { transform: scale(0.96); }

/* ===== 移动端控制（贴合画布底部，一体化）
       布局：
       ┌────────────────────────────┐
       │   [←]   [↓]   [→]           │  ← 上排：左 / 软降 / 右
       │   [↻]                       │
       │  [R]  [⤓硬降]    [↻]      │  ← 下排：重开(左下) / 硬降(中右) / 旋转(右下大)
       └────────────────────────────┘
     ===== */
.mobile-pad {
  padding: 4px 12px 2px;
  flex-shrink: 0;
}
.pad-row {
  display: flex;
  gap: 8px;
  justify-content: flex-start;
  margin-bottom: 8px;
}
.pad-row:last-child { margin-bottom: 0; }
.pad-row-top {
  /* 上排只放 3 个移动键：左侧 1/3 居中 */
  padding-left: 0;
}
.pad-row-bottom {
  /* 下排：重开 / 硬降 / 旋转 */
  justify-content: space-between;
  align-items: center;
}

.pad-btn {
  height: 46px;
  min-width: 56px;
  background: var(--card-bg);
  border: 1px solid var(--divider);
  border-radius: var(--radius-md);
  font-size: 20px;
  color: var(--text-h1);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
  -webkit-user-select: none;
  -webkit-tap-highlight-color: transparent;
  transition: all 0.1s;
  box-shadow: 0 2px 0 var(--divider);
  font-weight: 600;
  padding: 0 14px;
}
.pad-btn:active {
  transform: translateY(2px);
  box-shadow: none;
  background: var(--primary-light);
  color: var(--primary);
}
/* 上排 3 个移动键：均匀分布 */
.pad-row-top .pad-btn {
  flex: 1;
  max-width: 90px;
}
/* 软降：用主题浅色高亮 */
.pad-btn.pad-down { background: var(--primary-light); color: var(--primary); }
/* 重开：左下角小图标键 */
.pad-btn.pad-restart {
  width: 56px;
  padding: 0;
  color: var(--text-weak);
}
.pad-btn.pad-restart:active { color: var(--primary); }
/* 硬降：中右，深蓝色实心 */
.pad-btn.pad-hard {
  flex: 1;
  background: var(--primary);
  color: #fff;
  border-color: var(--primary);
  box-shadow: 0 2px 0 var(--primary-dark);
  font-size: 14px;
  max-width: 160px;
}
.pad-btn.pad-hard:active {
  background: var(--primary-dark);
  color: #fff;
}
/* 旋转：右下角独立大尺寸 */
.pad-btn.pad-rotate {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--primary);
  color: #fff;
  border-color: var(--primary);
  box-shadow: 0 3px 0 var(--primary-dark);
  padding: 0;
  font-size: 0;
}
.pad-btn.pad-rotate:active {
  background: var(--primary-dark);
  color: #fff;
  transform: translateY(2px);
  box-shadow: 0 1px 0 var(--primary-dark);
}
.rot-icon {
  font-size: 30px;
  line-height: 1;
  font-weight: 600;
  display: block;
}

/* ===== 底部操作说明（浅灰小字，居中） ===== */
.help-bar {
  display: flex;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
  font-size: 9px;
  color: var(--text-weak);
  padding: 4px 12px 6px;
  padding-bottom: max(6px, env(safe-area-inset-bottom));
  margin: 0;
  flex-shrink: 0;
  opacity: 0.7;
}
.help-bar span {
  display: inline-flex;
  align-items: center;
  gap: 2px;
}
.kbd {
  display: inline-block;
  min-width: 14px;
  text-align: center;
  padding: 0 3px;
  background: transparent;
  border: none;
  border-radius: 2px;
  font-size: 9px;
  color: var(--text-weak);
  font-family: monospace;
  line-height: 1.4;
}

/* ===== 适配更小屏（iPhone SE 等） ===== */
@media (max-height: 700px) {
  .top-bar { padding: 4px 12px 2px; }
  .title { font-size: 14px; }
  .icon-btn { width: 28px; height: 28px; }
  .stat-bar { padding: 2px 12px 4px; }
  .stat-chip { min-height: 36px; padding: 3px 5px; }
  .chip-value { font-size: 13px; }
  .next-mini { grid-template-columns: repeat(4, 6px); grid-template-rows: repeat(2, 6px); }
  .mini-cell { width: 6px; height: 6px; }
  .pad-btn { height: 40px; min-width: 48px; }
  .pad-btn.pad-rotate { width: 56px; height: 56px; }
  .pad-btn.pad-restart { width: 48px; }
  .help-bar { font-size: 8px; padding: 2px 12px 4px; }
}
@media (max-width: 360px) {
  .stat-bar { grid-template-columns: 1fr 1fr 1fr 1fr; gap: 4px; padding: 4px 8px 6px; }
  .chip-value { font-size: 13px; }
  .pad-btn { padding: 0 10px; font-size: 18px; }
  .pad-btn.pad-hard { font-size: 12px; }
}
</style>
