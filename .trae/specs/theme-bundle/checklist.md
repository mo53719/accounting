# 三套主题包系统 - Verification Checklist

## Core Storage
- [ ] localStorage 中只有 1 个主题相关 key：`themeSet`
- [ ] `themeSet` 的可选值仅为 `standard` / `pet` / `comic`
- [ ] 页面加载时 body 自动挂载对应的 `set-standard` / `set-pet` / `set-comic` class
- [ ] body 上不再出现旧的 `theme-green` / `style-pet` 等 class

## CSS 主题包
- [ ] `.set-standard` 定义完整色彩变量（--primary/--primary-light/--primary-dark/--shadow-hover）
- [ ] `.set-standard` 隐藏所有装饰容器：`.empty-state-mascot`、`.empty-state-comic`、`.hero-mini-decor`、`.pet-corner`、`.comic-corner`
- [ ] `.set-pet` 定义浅薄荷色完整色彩变量
- [ ] `.set-pet` 显示萌宠装饰 `.empty-state-mascot`、`.hero-mini-decor`、`.pet-corner`
- [ ] `.set-pet` 隐藏漫画装饰 `.empty-state-comic`、`.comic-corner`
- [ ] `.set-pet` 有细微爪印/卡片边框装饰
- [ ] `.set-comic` 定义手绘米色完整色彩变量
- [ ] `.set-comic` 显示漫画装饰 `.empty-state-comic`、`.hero-mini-decor`、`.comic-corner`
- [ ] `.set-comic` 隐藏萌宠装饰 `.empty-state-mascot`、`.pet-corner`
- [ ] 三套主题包色彩变量完整覆盖所有被业务代码使用的 CSS 变量

## SVG 装饰组件
- [ ] `PetMascot.vue` 的根容器 class 匹配 `pet-mascot` / `pet-mascot-mini` / `pet-mascot-corner`
- [ ] `PetMascot.vue` SVG 根节点 class 为 `pet-svg`
- [ ] `PetMascot.vue` 内部填充元素使用 `pet-fill-main` / `pet-fill-light` / `pet-fill-dark`
- [ ] `MangaMascot.vue` 同上：使用相同的 class 体系
- [ ] 装饰的尺寸在各场景中（large/mini/corner）正确显示

## 设置页 - 三套主题大卡片
- [ ] 弹窗内不再出现「界面风格/主题色调」双分区
- [ ] 弹窗中展示 3 张主题大卡片：标准/萌宠/漫画
- [ ] 每张卡片有预览色块（与主题色一致）
- [ ] 选中的卡片有 2px 边框、浅色背景、右上角 ✓
- [ ] 点击卡片后主题立即生效（body class 变化）
- [ ] 原有用户名输入框、设备名输入框、保存按钮、退出账本按钮仍正常工作

## 全页面装饰渲染
- [ ] **首页**：今日无记录的空白页显示对应装饰
- [ ] **首页**：其他日期无记录时的装饰
- [ ] **记账弹窗**（AddView）：数字键盘右下角角落装饰
- [ ] **设置页 hero 区**：迷你头像装饰
- [ ] **周期记账**（PeriodBooksView）：空白页装饰
- [ ] **标签管理**（TagsView）：空白页装饰
- [ ] **税费记录**（TaxRecordsView）：空白页装饰

## 过渡与动画
- [ ] 主题切换有 0.2s 的平滑过渡（色彩 + 装饰淡入淡出）
- [ ] 切换时不会出现空白闪烁
- [ ] blank 状态页面首次加载装饰有淡入效果

## 业务零改动（关键验证点）
- [ ] 用户名输入 → 保存 → 昵称更新正常
- [ ] 设备名输入 → 保存正常
- [ ] 退出账本功能正常
- [ ] 点击记账按钮 → 记账弹窗打开 → 输入 → 保存 → 新记录出现正常
- [ ] 账单列表页数据展示正常
- [ ] 预算管理功能正常
- [ ] 人情往来功能正常
- [ ] 底部导航栏：首页/统计/账本/设置四个入口跳转正常
- [ ] 按钮尺寸、图标未被装饰元素遮挡

## 持久化
- [ ] 选中主题后刷新页面，body class 保持不变
- [ ] 关闭浏览器重新打开，主题保持不变

## 构建
- [ ] `npm run build` exit code == 0
- [ ] `vue-tsc` 类型检查无错误
- [ ] 无 Vue 编译 warning

---

*Checklist 生成日期：2026-06-13*
