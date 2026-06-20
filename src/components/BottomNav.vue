﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿<template>
  <div class="bottom-nav">
    <div class="nav-inner">
      <router-link to="/home" class="nav-tab" :class="{ 'is-active': isActive('/home') }">
        <span class="tab-icon">
          <Icon name="home" :size="22" />
          <IllustrationImage
            v-if="isActive('/home') && currentThemeSet !== 'standard'"
            :theme="currentThemeSet" slot="navTabHome"
            module-id="nav-tab-1"
            css-class="tab-ip"
          />
        </span>
        <span class="tab-label">首页</span>
      </router-link>

      <router-link to="/stats" class="nav-tab" :class="{ 'is-active': isActive('/stats') }">
        <span class="tab-icon">
          <Icon name="stats" :size="22" />
          <IllustrationImage
            v-if="isActive('/stats') && currentThemeSet !== 'standard'"
            :theme="currentThemeSet" slot="navTabStats"
            module-id="nav-tab-2"
            css-class="tab-ip"
          />
        </span>
        <span class="tab-label">统计</span>
      </router-link>

      <router-link to="/add" class="nav-add" aria-label="记一笔">
        <div class="add-btn">
          <Icon name="add" :size="28" stroke="#FFFFFF" />
        </div>
      </router-link>

      <router-link to="/list" class="nav-tab" :class="{ 'is-active': isActive('/list') }">
        <span class="tab-icon">
          <Icon name="list" :size="22" />
          <IllustrationImage
            v-if="isActive('/list') && currentThemeSet !== 'standard'"
            :theme="currentThemeSet" slot="navTabBook"
            module-id="nav-tab-3"
            css-class="tab-ip"
          />
        </span>
        <span class="tab-label">账单</span>
      </router-link>

      <router-link to="/settings" class="nav-tab" :class="{ 'is-active': isActive('/settings') }">
        <span class="tab-icon">
          <Icon name="settings" :size="22" />
          <IllustrationImage
            v-if="isActive('/settings') && currentThemeSet !== 'standard'"
            :theme="currentThemeSet" slot="navTabSetting"
            module-id="nav-tab-4"
            css-class="tab-ip"
          />
        </span>
        <span class="tab-label">设置</span>
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import Icon from './icons/Icon.vue'
import IllustrationImage from './IllustrationImage.vue'
import { currentThemeSet } from '../composables/useTheme'
const route = useRoute()
function isActive(path: string) {
  return route.path === path
}
</script>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: var(--card-bg);
  border-top: 1px solid var(--divider);
  box-shadow: var(--shadow-soft);
}

.nav-inner {
  max-width: 480px;
  margin: 0 auto;
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 6px 8px calc(10px + env(safe-area-inset-bottom, 0px));
}

.nav-tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4px 12px 2px;
  text-decoration: none;
  min-width: 52px;
  color: var(--color-text-light);
  position: relative;
  transition: color 0.2s;
}

.nav-tab.is-active {
  color: var(--color-primary);
}

.nav-tab.is-active::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 18px;
  height: 2px;
  background: var(--color-primary);
  border-radius: 1px;
  transition: width 0.2s ease;
}

.tab-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 2px;
  position: relative;
}

/* active tab 右上角小 IP 贴纸 */
.tab-ip {
  position: absolute;
  top: -10px;
  right: -14px;
  width: 22px;
  height: 22px;
  object-fit: cover;
  border-radius: 50%;
  pointer-events: none;
  border: 1.5px solid var(--card-bg);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
}

.tab-label {
  font-size: 10px;
  letter-spacing: 0.02em;
}

/* 中间添加按钮（核心 C 位，悬浮） */
.nav-add {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-decoration: none;
  margin: 0 4px;
  transform: translateY(-12px);
}

.add-btn {
  width: 54px;
  height: 54px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary);
  color: #FFFFFF;
  box-shadow: 0 6px 14px rgba(82, 168, 140, 0.35);
  transition: transform 0.15s ease-out, box-shadow 0.15s ease-out;
}

.add-btn:active {
  transform: scale(0.96);
  box-shadow: 0 3px 8px rgba(82, 168, 140, 0.30);
}
</style>
