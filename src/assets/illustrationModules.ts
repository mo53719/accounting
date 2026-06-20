// 独立插画模块配置
// ------------------------------------------------------------------
// 设计目标：每一处需要插画的容器 = 1 个独立模块
// - 每个 moduleId 拥有自己的素材池、随机缓存（used 清单）
// - 关闭某一个模块的 enabled 开关，仅影响该模块
// - 切换页面/重新进入时，仅重置当前页面相关模块的缓存
// - 不同模块之间互不共享缓存 → 同页面不同区域也可使用同一张图
//
// 开关位置：在此文件中将 enabled 改为 false 即可关闭该模块
// ------------------------------------------------------------------

export type IllustrationModuleId =
  // ====== 首页（HomeView）======
  | 'home-balance-expense'   // 支出卡片背景
  | 'home-balance-income'    // 收入卡片背景
  | 'home-empty-bills'       // 空账单/空预算中央插画
  | 'home-empty-budget'
  | 'home-tx-item'           // 账单条目角标
  | 'home-modal-budget'      // 预算编辑弹窗
  | 'home-modal-month'       // 月度预算编辑弹窗
  // ====== 坚持天数（PersistentDaysView）======
  | 'persistent-hero'        // 顶部大卡片
  | 'persistent-mini-1'      // 3 个方块（各自独立）
  | 'persistent-mini-2'
  | 'persistent-mini-3'
  | 'persistent-sticker'     // 日历有记账日期格的角落贴纸
  // ====== 数据统计（StatsView）======
  | 'stats-balance-expense'  // 收支汇总
  | 'stats-balance-income'
  | 'stats-rank'             // 分类排行
  // ====== 使用分类（CategoryUsageView）======
  | 'category-usage-summary' // 顶部分类总数卡片
  | 'category-usage-rank'    // 分类排行条目
  | 'category-usage-type-expense'  // 底部支出方块
  | 'category-usage-type-income'   // 底部收入方块
  // ====== 设置（SettingsView）======
  | 'settings-hero'          // 顶部用户卡片
  | 'settings-stat-count'    // 3 张数据卡 · 记账总数（与首页 home-balance-expense 同卡样）
  | 'settings-stat-days'     // 3 张数据卡 · 坚持天数（与首页 home-balance-income 同卡样）
  | 'settings-stat-categories' // 3 张数据卡 · 使用分类（与首页 home-balance-expense 同卡样）
  | 'settings-stat'          // 3 张数据卡（统一池，兼容旧用法）
  | 'settings-modal'         // 主题预览弹窗
  // ====== 底部导航（BottomNav）======
  | 'nav-tab-1'              // 4 个 tab
  | 'nav-tab-2'
  | 'nav-tab-3'
  | 'nav-tab-4'
  // ====== 存钱计划 / 人情往来（独立空态插画）======
  | 'savings-empty'          // 存钱计划空状态插画
  | 'lend-empty'             // 人情往来空状态插画
  // ====== PaintedScene 内部模块（chartBg / scene 等）======
  | 'painted-scene-chart-bg' // 图表容器背景
  // ====== 全部账单（ListView）======
  | 'list-tx-item'           // 账单条目角落小贴纸
  // ====== 全局数据报表（ReportView）======
  | 'report-income'           // 汇总卡 · 收入（独立模块池，同页不重复）
  | 'report-expense'          // 汇总卡 · 支出
  | 'report-balance'          // 汇总卡 · 结余
  | 'report-count'            // 汇总卡 · 笔数
  // ====== 记账总数（TransactionCountView）======
  | 'txcount-hero'           // 顶部大卡片
  | 'txcount-mini-1'         // 3 个方块（支出笔数/收入笔数/活跃天数）
  | 'txcount-mini-2'
  | 'txcount-mini-3'
  | 'txcount-tx-item'        // 每日账单条目角落小贴纸
  // ====== TransactionItem 默认池（外部传入的 pageId）======
  | 'tx-item'                // TransactionItem 通用模块

export interface ModuleConfig {
  /** 是否启用（false = 该模块不渲染任何插画） */
  enabled: boolean
  /** 模块说明（仅做备注） */
  description: string
}

/** 全局模块配置：在此处修改 enabled 即可独立关闭某个模块 */
export const illustrationModuleConfig: Record<IllustrationModuleId, ModuleConfig> = {
  // HomeView
  'home-balance-expense':     { enabled: true,  description: '首页 · 支出卡片大图背景' },
  'home-balance-income':      { enabled: true,  description: '首页 · 收入卡片大图背景' },
  'home-empty-bills':         { enabled: true,  description: '首页 · 空账单中央插画' },
  'home-empty-budget':        { enabled: true,  description: '首页 · 空预算中央插画' },
  'home-tx-item':             { enabled: true,  description: '首页 · 账单条目角落小贴纸' },
  'home-modal-budget':        { enabled: true,  description: '首页 · 预算弹窗角标' },
  'home-modal-month':         { enabled: true,  description: '首页 · 月度预算弹窗角标' },
  // PersistentDaysView
  'persistent-hero':          { enabled: true,  description: '坚持天数 · 顶部大卡片' },
  'persistent-mini-1':        { enabled: true,  description: '坚持天数 · 最长连续方块' },
  'persistent-mini-2':        { enabled: true,  description: '坚持天数 · 当前连续方块' },
  'persistent-mini-3':        { enabled: true,  description: '坚持天数 · 记账笔数方块' },
  'persistent-sticker':       { enabled: true,  description: '坚持天数 · 日历有记账日期格角标' },
  // StatsView
  'stats-balance-expense':    { enabled: true,  description: '统计 · 支出汇总卡' },
  'stats-balance-income':     { enabled: true,  description: '统计 · 收入汇总卡' },
  'stats-rank':               { enabled: true,  description: '统计 · 分类排行条目' },
  // CategoryUsageView
  'category-usage-summary':   { enabled: true,  description: '使用分类 · 顶部大卡片' },
  'category-usage-rank':      { enabled: true,  description: '使用分类 · 分类排行条目' },
  'category-usage-type-expense': { enabled: true, description: '使用分类 · 支出方块角标' },
  'category-usage-type-income':  { enabled: true, description: '使用分类 · 收入方块角标' },
  // SettingsView
  'settings-hero':            { enabled: true,  description: '设置 · 顶部用户卡片' },
  'settings-stat-count':      { enabled: true,  description: '设置 · 3 张数据卡 · 记账总数（与首页 home-balance-expense 同卡样）' },
  'settings-stat-days':       { enabled: true,  description: '设置 · 3 张数据卡 · 坚持天数（与首页 home-balance-income 同卡样）' },
  'settings-stat-categories': { enabled: true,  description: '设置 · 3 张数据卡 · 使用分类（与首页 home-balance-expense 同卡样）' },
  'settings-stat':            { enabled: true,  description: '设置 · 3 张数据卡（统一池，兼容旧用法）' },
  'settings-modal':           { enabled: true,  description: '设置 · 主题预览弹窗' },
  // BottomNav
  'nav-tab-1':                { enabled: true,  description: '底部导航 · 首页 tab' },
  'nav-tab-2':                { enabled: true,  description: '底部导航 · 统计 tab' },
  'nav-tab-3':                { enabled: true,  description: '底部导航 · 账本 tab' },
  'nav-tab-4':                { enabled: true,  description: '底部导航 · 设置 tab' },
  // 存钱计划 / 人情往来
  'savings-empty':            { enabled: true,  description: '存钱计划 · 空状态插画' },
  'lend-empty':               { enabled: true,  description: '人情往来 · 空状态插画' },
  // PaintedScene
  'painted-scene-chart-bg':   { enabled: true,  description: '图表容器背景' },
  // ListView
  'list-tx-item':             { enabled: true,  description: '全部账单 · 账单条目角标' },
  // ReportView
  'report-income':            { enabled: true,  description: '报表 · 汇总卡收入（独立模块池，同页不重复）' },
  'report-expense':           { enabled: true,  description: '报表 · 汇总卡支出' },
  'report-balance':           { enabled: true,  description: '报表 · 汇总卡结余' },
  'report-count':             { enabled: true,  description: '报表 · 汇总卡笔数' },
  // TransactionCountView
  'txcount-hero':             { enabled: true,  description: '记账总数 · 顶部大卡片' },
  'txcount-mini-1':           { enabled: true,  description: '记账总数 · 支出笔数方块' },
  'txcount-mini-2':           { enabled: true,  description: '记账总数 · 收入笔数方块' },
  'txcount-mini-3':           { enabled: true,  description: '记账总数 · 活跃天数据方块' },
  'txcount-tx-item':          { enabled: true,  description: '记账总数 · 每日账单条目角标' },
  // TransactionItem 通用
  'tx-item':                  { enabled: true,  description: 'TransactionItem 默认模块' },
}

/** 检查模块是否启用（未知 moduleId 默认启用） */
export function isModuleEnabled(moduleId: string): boolean {
  if (!moduleId) return false
  const cfg = illustrationModuleConfig[moduleId as IllustrationModuleId]
  return cfg ? cfg.enabled : true
}
