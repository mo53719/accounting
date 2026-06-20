import dayjs from 'dayjs'

export function formatMoney(amount: number): string {
  return amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

export function formatDate(date: string | Date, format = 'YYYY-MM-DD'): string {
  return dayjs(date).format(format)
}

export function formatDateTime(date: string | Date): string {
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

export function getMonthRange(year: number, month: number) {
  const start = dayjs().year(year).month(month - 1).startOf('month').format('YYYY-MM-DD')
  const end = dayjs().year(year).month(month - 1).endOf('month').format('YYYY-MM-DD')
  return { start, end }
}

export function getCurrentMonth(): { year: number; month: number } {
  const now = dayjs()
  return { year: now.year(), month: now.month() + 1 }
}

// 预设图标库 — 总量 = 60，覆盖常见收支类目
// 与 SVG_ICON_PATHS key 一一对应，确保每个图标都能正常渲染
export const ICON_PRESETS = [
  // —— 餐饮/食品 ——
  'utensils', 'coffee', 'cup', 'cookie', 'pizza',
  // —— 出行/交通 ——
  'car', 'bus', 'plane', 'bike', 'train', 'ship',
  // —— 购物/商业 ——
  'shopping-cart', 'shopping-bag', 'gift', 'tag', 'package',
  // —— 居家/生活 ——
  'home', 'lamp', 'bed', 'key', 'tv',
  // —— 人情/社交 ——
  'heart', 'users', 'smile', 'thumbs-up',
  // —— 医疗/健康 ——
  'activity', 'heart-pulse', 'droplet', 'stethoscope',
  // —— 数码/电子 ——
  'phone', 'camera', 'headphones', 'watch',
  // —— 运动/健身 ——
  'flame', 'star', 'zap', 'dumbbell', 'trophy',
  // —— 教育/学习 ——
  'book', 'graduation-cap', 'pencil',
  // —— 理财/金融 ——
  'briefcase', 'dollar-sign', 'credit-card', 'wallet', 'banknote',
  // —— 时间/日期 ——
  'calendar', 'clock',
  // —— 天气/自然 ——
  'sun', 'cloud', 'leaf', 'droplets',
  // —— 工具/维修 ——
  'wrench', 'scissors', 'hammer',
  // —— 通讯/信息 ——
  'mail', 'message-circle', 'bell',
  // —— 地图/位置 ——
  'map-pin', 'compass',
] as const

// 预设分类（不可删除）—— 统一主色线性图标风格
export const CATEGORIES: {
  expense: { name: string; icon: string; type: 'expense' | 'income'; color: string; bgColor: string }[];
  income: { name: string; icon: string; type: 'expense' | 'income'; color: string; bgColor: string }[];
} = {
  expense: [
    { name: '餐饮', icon: 'utensils', type: 'expense', color: '#e77f67', bgColor: '#fdebe7' },
    { name: '交通', icon: 'car', type: 'expense', color: '#e77f67', bgColor: '#fdebe7' },
    { name: '购物', icon: 'shopping-cart', type: 'expense', color: '#e77f67', bgColor: '#fdebe7' },
    { name: '居家', icon: 'home', type: 'expense', color: '#e77f67', bgColor: '#fdebe7' },
    { name: '人情', icon: 'heart', type: 'expense', color: '#e77f67', bgColor: '#fdebe7' },
    { name: '其他', icon: 'star', type: 'expense', color: '#e77f67', bgColor: '#fdebe7' },
  ],
  income: [
    { name: '工资', icon: 'briefcase', type: 'income', color: '#69bb9c', bgColor: '#e6f7f0' },
    { name: '红包', icon: 'gift', type: 'income', color: '#69bb9c', bgColor: '#e6f7f0' },
    { name: '其他', icon: 'smile', type: 'income', color: '#69bb9c', bgColor: '#e6f7f0' },
  ],
}

export const PAYMENT_METHODS = [
  { name: '现金', icon: 'dollar-sign' },
  { name: '微信', icon: 'message-circle' },
  { name: '支付宝', icon: 'credit-card' },
  { name: '银行卡', icon: 'credit-card' },
] as const

// 默认记账人（初始化用）
export const DEFAULT_MEMBERS = [
  { name: '我', icon: 'user' },
  { name: '老公', icon: 'user' },
  { name: '老婆', icon: 'user' },
] as const

// 向后兼容
export const FAMILY_MEMBERS = DEFAULT_MEMBERS

// ============ 线性 SVG 图标库（Feather 风格） ============
// 每个图标返回一组 path/d/circle/line 元素字符串，用于 innerHTML 注入
// viewBox 统一 0 0 24 24，stroke-width = 2，round 边角
export const SVG_ICON_PATHS: Record<string, string> = {
  utensils: '<path d="M3 2v7c0 1.1.9 2 2 2h0a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/>',
  coffee: '<path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4z"/><line x1="6" y1="2" x2="6" y2="4"/><line x1="10" y1="2" x2="10" y2="4"/><line x1="14" y1="2" x2="14" y2="4"/>',
  cup: '<path d="M3 4h12l-1.5 12a3 3 0 0 1-3 2.5h-3a3 3 0 0 1-3-2.5L3 4z"/><path d="M7 22h4"/><line x1="3" y1="4" x2="15" y2="4"/>',
  'shopping-cart': '<circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"/>',
  'shopping-bag': '<path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>',
  car: '<path d="M5 17h14l-1.5-5.5a2 2 0 0 0-2-1.5h-7a2 2 0 0 0-2 1.5L5 17z"/><circle cx="7.5" cy="17.5" r="1.5"/><circle cx="16.5" cy="17.5" r="1.5"/><path d="M3 17v-3"/><path d="M21 17v-3"/>',
  bus: '<rect x="4" y="4" width="16" height="14" rx="2"/><line x1="4" y1="10" x2="20" y2="10"/><circle cx="8" cy="14" r="1"/><circle cx="16" cy="14" r="1"/>',
  train: '<rect x="4" y="3" width="16" height="15" rx="2"/><line x1="4" y1="10" x2="20" y2="10"/><circle cx="8" cy="14" r="1"/><circle cx="16" cy="14" r="1"/><path d="M8 21l2-3M16 21l-2-3"/>',
  plane: '<path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.5.8c-.2.5 0 1 .4 1.2L9 11l-3 3c-1 .5-1 2-.5 2.5L8 18l4 4c.5.5 2 0 2.5-.5l3-3 2.3 5.5c.2.4.7.6 1.2.4l.8-.4c.4-.2.6-.6.5-1.1z"/>',
  bike: '<circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-3 11.5V14l-3-3 4-3 2 3h2"/>',
  'gas-pump': '<path d="M3 22h12V4H3v18z"/><line x1="7" y1="8" x2="11" y2="8"/><path d="M15 8h3a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-3"/>',
  home: '<path d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/>',
  lamp: '<path d="M9 2h6l2 5H7l2-5z"/><line x1="12" y1="7" x2="12" y2="14"/><path d="M8 22h8l-1-5H9l-1 5z"/>',
  bed: '<path d="M2 16V8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8"/><line x1="2" y1="14" x2="22" y2="14"/><circle cx="7" cy="11" r="1"/>',
  key: '<circle cx="8" cy="15" r="4"/><path d="m10.8 12.2 10-10-1.5-1.5L9 11"/>',
  wrench: '<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18v3h3l6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.8-2.6z"/>',
  leaf: '<path d="M11 20A7 7 0 0 1 4 13c0-5 4-8 9-8 6 0 9 4 9 9a7 7 0 0 1-7 7z"/><path d="M4 20c4-4 7-7 12-12"/>',
  heart: '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>',
  gift: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5C11 3 12 8 12 8s1-5 4.5-5a2.5 2.5 0 0 1 0 5z"/>',
  smile: '<circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>',
  star: '<polygon points="12 2 15.1 8.6 22 9.3 17 14.1 18.2 21 12 17.8 5.8 21 7 14.1 2 9.3 8.9 8.6 12 2"/>',
  zap: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
  book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
  'graduation-cap': '<path d="M22 10 12 5 2 10l10 5 10-5z"/><path d="M6 12v5a6 6 0 0 0 12 0v-5"/>',
  briefcase: '<rect x="2" y="7" width="20" height="14" rx="2"/><rect x="9" y="3" width="6" height="4" rx="1"/><line x1="2" y1="13" x2="22" y2="13"/>',
  'dollar-sign': '<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',
  'credit-card': '<rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>',
  pocket: '<path d="M4 3h16v18H4z"/><path d="M16 10h-3a2 2 0 0 0 0 4h3"/>',
  'piggy-bank': '<path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-7.5-1-9 1-1 1.3 0 2 .5 3-.8 1.4-.5 3 1 4 .5.5 1 1.5 1 2 0 1-1 2-2 2v1h10v-2c0-1.5.5-2.5 2-3.5.5-.5 1-1 1-2 0-.5-.5-1-.5-1.5 1.5 0 2.5-1 2.5-2.5 0-1-1-2.5-3-2.5z"/>',
  'trending-up': '<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>',
  music: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
  camera: '<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>',
  film: '<rect x="2" y="2" width="20" height="20" rx="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="17" x2="22" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/>',
  'gamepad-2': '<line x1="6" y1="11" x2="10" y2="11"/><line x1="8" y1="9" x2="8" y2="13"/><line x1="15" y1="12" x2="15.01" y2="12"/><line x1="18" y1="10" x2="18.01" y2="10"/><path d="M17.32 5H6.68a4 4 0 0 0-3.98 3.59l-1.54 8.35A4 4 0 0 0 5.14 22h13.72a4 4 0 0 0 4-5.06L21.3 8.6A4 4 0 0 0 17.32 5z"/>',
  sun: '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>',
  moon: '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>',
  cloud: '<path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/>',
  umbrella: '<path d="M23 12a11 11 0 0 0-22 0 1 1 0 0 0 2 0 3 3 0 0 1 6 0 1 1 0 0 0 2 0 3 3 0 0 1 6 0 1 1 0 0 0 2 0 3 3 0 0 1 6 0 1 1 0 0 0 2 0z"/><line x1="12" y1="12" x2="12" y2="22"/>',
  users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
  mail: '<path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/><polyline points="22,6 12,13 2,6"/>',
  activity: '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>',
  'heart-pulse': '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/><polyline points="3.5 12 7 12 9 8 12 16 15 10 17 12 20.5 12"/>',
  droplet: '<path d="M12 2.69s-6.2 7-6.2 12.11a6.2 6.2 0 0 0 12.4 0c0-5.11-6.2-12.11-6.2-12.11z"/>',
  flame: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.18-.5-5 2-8 0 0 3 4 4 7 1 3 2 6 2 8a5 5 0 0 1-9.5 2.5z"/>',
  'map-pin': '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
  compass: '<circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>',
  navigation: '<polygon points="3 11 22 2 13 21 11 13 3 11"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
  clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  monitor: '<rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>',
  wallet: '<path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"/><path d="M4 6v12c0 1.1.9 2 2 2h14v-4"/><path d="M18 12a2 2 0 0 0 0 4h4v-4h-4z"/>',
  scissors: '<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/>',
  'message-circle': '<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>',
  cookie: '<path d="M21.59 7.84c-.4-1.24-1.58-2.18-3.08-2.18-1.06 0-2.02.45-2.73 1.19-.3-.26-.7-.42-1.13-.42-.3 0-.58.07-.83.19-.39-.69-1.12-1.15-1.96-1.15-1.2 0-2.17.95-2.17 2.12 0 .26.06.5.16.72C9.11 7.95 8.1 8 7.31 8.56 6.1 9.4 5.92 11.12 6.85 12.12l-1 1.12c-.98-1.08-2.61-1.04-3.52.09-.86 1.1-.78 2.77.18 3.77 1.03 1.1 2.67 1.3 3.86.53 1.18.77 2.73.74 3.86-.26l1.12 1.08c-1 1.08-1.04 2.61.09 3.52 1.1.86 2.77.78 3.77-.18 1.1-1.03 1.3-2.67.53-3.86.74-1.18.74-2.73-.26-3.86l1.08-1.12c1.08 1 2.61 1.04 3.52-.09.86-1.1.78-2.77-.18-3.77z"/>',
  pizza: '<path d="M2 16.5 12 3l10 13.5a1 1 0 0 1-1.67 1.11L14 17l-2 3-4.33-2.39A1 1 0 0 1 2 16.5z"/><circle cx="8.5" cy="14.5" r="1"/><circle cx="12.5" cy="10.5" r="1"/><circle cx="15.5" cy="15.5" r="1"/>',
  ship: '<path d="M3 18l2-12h14l2 12"/><path d="M3 18c0 1 1.5 2 4 2s4-1 4-2 1.5-2 4-2 4 1 4 2-1.5 2-4 2-4-1-4-2 1.5-2 4-2 4 1 4 2"/><line x1="12" y1="6" x2="12" y2="2"/><path d="M2 18h20"/>',
  tag: '<path d="M20.59 13.41 11 3.83A2 2 0 0 0 9.59 3H4a1 1 0 0 0-1 1v5.59a2 2 0 0 0 .59 1.41l9.58 9.58a2 2 0 0 0 2.83 0l4.59-4.58a2 2 0 0 0 0-2.82z"/><circle cx="7.5" cy="7.5" r="1.5"/>',
  package: '<path d="M16.5 9.4 7.55 4.24"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><path d="m3.27 6.96 8.73 5.05 8.73-5.05"/><path d="M12 22.08V12"/>',
  tv: '<rect x="2" y="7" width="20" height="13" rx="2"/><polyline points="17 2 12 7 7 2"/>',
  'thumbs-up': '<path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H7V10l5-7c1.5 0 3 1.5 3 3 0 1-.5 2-1.5 2.88z"/>',
  thermometer: '<path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4 4 0 1 0 5 0z"/>',
  stethoscope: '<path d="M11 2v12a4 4 0 0 0 4 4h0a4 4 0 0 0 4-4V8"/><path d="M4.13 12A6 6 0 0 1 4 10V2h7"/><circle cx="12" cy="19" r="2"/><path d="M8 2h7"/>',
  headphones: '<path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>',
  watch: '<circle cx="12" cy="12" r="6"/><polyline points="12 10 12 12 13 13"/><path d="M16.13 7.66 18 2l-4 2.34"/><path d="M7.88 7.66 6 2l4 2.34"/>',
  dumbbell: '<circle cx="5" cy="6" r="3"/><circle cx="5" cy="18" r="3"/><circle cx="19" cy="6" r="3"/><circle cx="19" cy="18" r="3"/><line x1="8" y1="8" x2="16" y2="16"/><line x1="8" y1="16" x2="16" y2="8"/>',
  trophy: '<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>',
  pencil: '<path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>',
  banknote: '<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/>',
  droplets: '<path d="M12 2.69s-6.2 7-6.2 12.11a6.2 6.2 0 0 0 12.4 0c0-5.11-6.2-12.11-6.2-12.11z"/><path d="M6 15.5s-2.5 2.8-2.5 5a2.5 2.5 0 0 0 5 0c0-2.2-2.5-5-2.5-5z"/>',
  hammer: '<path d="m15 12-8.5 8.5a2.12 2.12 0 1 1-3-3L12 9"/><path d="M17.64 15 22 10.64"/><path d="m20.91 11.7-1.25-1.25c-.6-.58-1.49-.72-2.27-.42L15 11l4 4 1.95-2.4c.3-.78.16-1.67-.42-2.27z"/>',
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
}
