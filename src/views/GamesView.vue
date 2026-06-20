<template>
  <div class="page">
    <div class="page-header">
      <span class="back-btn" @click="$router.back()" aria-label="返回">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
      </span>
      <div class="flex-1">
        <h1 class="page-title">娱乐游戏</h1>
        <p class="page-subtitle">闲暇放松 · 玩个小游戏</p>
      </div>
    </div>

    <div class="page-body">
      <!-- 列表卡片 -->
      <div class="game-list">
        <div
          v-for="(g, idx) in games"
          :key="g.id"
          class="game-item"
          :class="{ 'first-item': idx === 0 }"
          @click="openGame(g)"
          role="button"
          tabindex="0"
          @keydown.enter="openGame(g)"
        >
          <div class="game-icon" :style="{ background: g.iconBg }">
            <Icon :name="g.iconName" :size="26" />
          </div>
          <div class="game-info">
            <p class="game-name">{{ g.name }}</p>
            <p class="game-desc">{{ g.desc }}</p>
          </div>
          <span class="game-arrow" aria-hidden="true">›</span>
        </div>

        <!-- 占位：后续新增游戏时直接 push 到 games 数组 -->
        <div v-if="games.length === 0" class="empty-line">暂无游戏</div>
      </div>

      <!-- 底部留白说明 -->
      <p class="tip">更多游戏正在开发中，敬请期待 ✨</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import Icon from '../components/icons/Icon.vue'

const router = useRouter()

/* ============================================================
 * 游戏列表
 * - 新增游戏只需在下方数组追加一项即可，无需改动页面结构
 * - 字段：id / name(中文) / desc(描述) / iconName(Icon组件名) /
 *         iconBg(图标背景色，可选) / path(点击跳转路径)
 * ============================================================ */
interface Game {
  id: string
  name: string
  desc: string
  iconName: string
  iconBg?: string
  path: string
}

const games: Game[] = [
  {
    id: 'tetris',
    name: '俄罗斯方块',
    desc: '经典消除 · 动动手指',
    iconName: 'tetris',
    iconBg: 'var(--primary-light)',
    path: '/tetris',
  },
  // 后续新增游戏在此追加，例如：
  // { id: 'snake', name: '贪吃蛇', desc: '...', iconName: '...', path: '/snake' },
]

function openGame(g: Game) {
  router.push(g.path)
}
</script>

<style scoped>
.page {
  background: var(--page-bg);
  min-height: 100vh;
  padding-bottom: 40px;
}

.page-header {
  padding: 50px 16px 12px;
  display: flex;
  align-items: center;
  gap: 12px;
}
.flex-1 { flex: 1; min-width: 0; }
.page-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-h1);
  margin: 0;
}
.page-subtitle {
  font-size: 12px;
  color: var(--text-weak);
  margin: 2px 0 0;
}
.back-btn {
  width: 36px;
  height: 36px;
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
}
.back-btn:active { transform: scale(0.94); }

.page-body {
  padding: 0 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 列表容器：白色卡片包住所有游戏 */
.game-list {
  background: var(--card-bg);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-soft);
  overflow: hidden;
}

.game-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  cursor: pointer;
  transition: background 0.15s ease;
  position: relative;
  outline: none;
}
.game-item:hover { background: var(--page-bg); }
.game-item:active { background: var(--primary-light); }
.game-item:focus-visible { box-shadow: inset 0 0 0 2px var(--primary); }

/* 条目之间分隔线：除第一条外加 */
.game-item + .game-item {
  border-top: 1px solid var(--divider);
}

/* 游戏图标：圆角色块 */
.game-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: var(--primary);
}

/* 中间信息 */
.game-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.game-name {
  font-size: 15px;
  font-weight: 500;
  color: var(--text-h1);
  margin: 0;
  line-height: 1.3;
}
.game-desc {
  font-size: 12px;
  color: var(--text-weak);
  margin: 0;
  line-height: 1.3;
}

/* 右侧箭头 */
.game-arrow {
  font-size: 22px;
  color: var(--text-weak);
  line-height: 1;
  flex-shrink: 0;
  font-weight: 300;
}

.empty-line {
  text-align: center;
  font-size: 13px;
  color: var(--text-weak);
  padding: 24px 0;
}

/* 底部提示 */
.tip {
  text-align: center;
  font-size: 12px;
  color: var(--text-weak);
  margin: 4px 0 0;
}
</style>
