# 主题切换说明

> 本项目提供 **2 套**独立主题（标准纯净简约 / 海贼王人物包），可在设置中切换并持久化保存。
> 主题不仅切换色系，还联动**插画模块池**（每个区域独立缓存）—— 切到标准主题时自动清空所有插画。

---

## 1. 主题列表

| 主题 ID | 名称 | 主色 | 装饰 | 适用场景 |
|---------|------|------|------|----------|
| `standard` | 标准纯净简约 | 薄荷绿 `#52a88c` | 无插画、纯净底色 | 商务、日常、低内存设备 |
| `onepiece` | 海贼王人物包 | 海洋蓝 `#1E5A8A` | 全套海贼王角色插画 | 个性化、有 IP 偏好 |

> 旧版本（v0.x）的 `pet` / `comic` 键已自动迁移到 `onepiece`，老用户数据零丢失。

---

## 2. 切换主题

### 2.1 入口

- 底部 Tab → **设置** → **主题** → 选主题卡片

### 2.2 切换效果

1. **色系**：主色、按钮、Tab 选中态、海贼王底层暗纹
2. **插画**：所有装饰插画（包括英雄区 / 卡片角标 / 空状态插画）按主题显示
3. **图标**：部分图标会随主题变色（标准 = 薄荷绿 / 海贼王 = 海洋蓝）

### 2.3 持久化

- 切换后**立即**写入 `localStorage.fab_themeSet`
- 重启 APP / 杀进程 / 关闭后重开 → 自动恢复上次主题
- 登录页 `/entry` 也按当前主题显示对应插画

---

## 3. 主题技术细节

### 3.1 CSS 变量机制

全局样式在 `src/assets/styles/main.css`：

```css
:root {
  --primary: #52a88c;          /* 标准主色 */
  --primary-light: #e6f3ee;
  ...
}

.set-onepiece,
.set-onepiece #app {
  --primary: #1E5A8A;          /* 海贼王主色覆盖 */
  --primary-light: #E6F0F8;
  --primary-dark: #0F3A66;
}
```

`<body>` 动态挂载 `set-standard` 或 `set-onepiece` class → CSS 变量自动级联到所有子元素。

### 3.2 插画模块池

`src/composables/useIllustrationPicker.ts`：

- 每个 `moduleId`（如 `home-balance-expense`、`list-tx-item`）拥有**独立素材池**
- 同一 moduleId 共享 `used` 集合，保证不重复
- 不同 moduleId 互不干扰
- **标准主题下所有模块 pickOne 永远返回空字符串**（无插画）

### 3.3 主题切换时清池

`src/composables/useTheme.ts`：

```ts
watch(currentThemeSet, (newVal) => {
  applyTheme(newVal)
  saveThemeSet()
  clearAllIllustrationPools()   // 关键：清空全部 pool
})
```

不清池 → 切回标准主题仍可能显示旧插画（视觉残留）。

---

## 4. 单独关闭某个模块插画

如需在海贼王主题下禁用某个区域的插画（如首页空状态不要插画）：

编辑 `src/assets/illustrationModules.ts`，将对应 moduleId 设置为 `false`：

```ts
export const MODULE_ENABLED: Record<string, boolean> = {
  'home-balance-expense': true,
  'home-balance-income': true,
  'home-empty-bills': false,   // 关闭首页空状态插画
  'list-tx-item': true,
  ...
}
```

页面级独立开关不影响其他区域。

---

## 5. 添加新主题（不推荐，需大幅改动）

> ⚠️ 本次范围不包含添加「猫和老鼠」等新主题。如需新增，需：

1. 准备素材文件夹（建议 ≥ 20 张 PNG/JPG）
2. 编辑 `src/assets/illustrations.config.ts` 新增 `ALL_xxx_URLS`
3. 编辑 `src/composables/useTheme.ts` 的 `VALID_THEME_SETS` 与 `themeSetList`
4. 编辑 `src/assets/styles/main.css` 新增 `.set-xxx` 主题色块
5. 修改 `useIllustrationPicker.ts` 的素材源引用

---

## 6. 验收点（手测）

- [ ] 切到海贼王：所有装饰位都出现角色图
- [ ] 切回标准：所有装饰位**清空**，无残留
- [ ] 切主题时无白屏/无报错
- [ ] 切换后**立即**刷新本地存储
- [ ] 重启 APP 后主题保留
- [ ] 登录页主题与设置一致

---

## 7. 常见问题

| Q | A |
|---|---|
| 切到标准主题仍显示旧图？ | 浏览器缓存。强制刷新（Ctrl+Shift+R）或清缓存 |
| 切主题后页面错位？ | 检查 `useTheme.ts` 是否正确调用 `clearAllIllustrationPools` |
| 主题不持久？ | 确认 localStorage 中 `fab_themeSet` 写入成功（DevTools → Application → LocalStorage） |
