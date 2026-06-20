/* ============================================================
 * 主题感知图标库
 *  - 3 套主题 × 20+ 图标
 *  - standard: 2px Feather 线性（参考 feather-icons）
 *  - pet:      2.5-3px 圆润萌系（带小圆点尾巴、胖耳）
 *  - comic:    1.8-2px 手绘抖动感（path 用 filter 手绘化）
 *  - 所有 path 在 24x24 viewBox 坐标系内
 * ============================================================ */

import type { ThemeSet } from '../../composables/useTheme'

export interface IconDef {
  viewBox: string
  paths: string      // SVG innerHTML (paths/circles/lines)
  /** 不同主题默认 stroke-width */
  strokeWidth: number
}

/* ============================================================
 * 标准简约 2px Feather 线性
 * ============================================================ */
const standardIcons: Record<string, IconDef> = {
  home: {
    viewBox: '0 0 24 24',
    strokeWidth: 2,
    paths: `<path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-7h-6v7H4a1 1 0 0 1-1-1V9.5z"/>`,
  },
  stats: {
    viewBox: '0 0 24 24',
    strokeWidth: 2,
    paths: `<line x1="3" y1="20" x2="3" y2="10"/><line x1="9" y1="20" x2="9" y2="4"/><line x1="15" y1="20" x2="15" y2="14"/><line x1="21" y1="20" x2="21" y2="7"/>`,
  },
  list: {
    viewBox: '0 0 24 24',
    strokeWidth: 2,
    paths: `<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/>`,
  },
  add: {
    viewBox: '0 0 24 24',
    strokeWidth: 2.5,
    paths: `<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>`,
  },
  check: {
    viewBox: '0 0 24 24',
    strokeWidth: 2.5,
    paths: `<polyline points="20 6 9 17 4 12"/>`,
  },
  tetris: {
    viewBox: '0 0 24 24',
    strokeWidth: 2,
    paths: `<rect x="3" y="3" width="8" height="8" rx="1"/><rect x="13" y="3" width="8" height="4" rx="1"/><rect x="13" y="9" width="4" height="6" rx="1"/><rect x="3" y="13" width="6" height="8" rx="1"/><rect x="11" y="17" width="10" height="4" rx="1"/>`,
  },
  close: {
    viewBox: '0 0 24 24',
    strokeWidth: 2,
    paths: `<line x1="6" y1="6" x2="18" y2="18"/><line x1="6" y1="18" x2="18" y2="6"/>`,
  },
  eye: {
    viewBox: '0 0 24 24',
    strokeWidth: 2,
    paths: `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>`,
  },
  eyeOff: {
    viewBox: '0 0 24 24',
    strokeWidth: 2,
    paths: `<path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 4.22-5.5M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19M14.12 14.12A3 3 0 1 1 9.88 9.88"/><line x1="1" y1="1" x2="23" y2="23"/>`,
  },
  lock: {
    viewBox: '0 0 24 24',
    strokeWidth: 2,
    paths: `<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>`,
  },
  user: {
    viewBox: '0 0 24 24',
    strokeWidth: 2,
    paths: `<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>`,
  },
  bell: {
    viewBox: '0 0 24 24',
    strokeWidth: 2,
    paths: `<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>`,
  },
  settings: {
    viewBox: '0 0 24 24',
    strokeWidth: 2,
    paths: `<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>`,
  },
  chart: {
    viewBox: '0 0 24 24',
    strokeWidth: 2,
    paths: `<path d="M3 3v18h18"/><path d="M7 14l4-4 4 4 5-5"/>`,
  },
  wallet: {
    viewBox: '0 0 24 24',
    strokeWidth: 2,
    paths: `<path d="M21 12V8a2 2 0 0 0-2-2H5a2 2 0 0 1 0-4h12v4"/><path d="M3 6v12a2 2 0 0 0 2 2h16v-4"/><path d="M16 14h6"/>`,
  },
  arrowRight: {
    viewBox: '0 0 24 24',
    strokeWidth: 2,
    paths: `<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>`,
  },
  arrowLeft: {
    viewBox: '0 0 24 24',
    strokeWidth: 2,
    paths: `<line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>`,
  },
  pencil: {
    viewBox: '0 0 24 24',
    strokeWidth: 2,
    paths: `<path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4z"/>`,
  },
  paw: {
    viewBox: '0 0 24 24',
    strokeWidth: 2,
    paths: `<circle cx="11" cy="4" r="2"/><circle cx="18" cy="8" r="2"/><circle cx="4" cy="8" r="2"/><circle cx="7" cy="14" r="2"/><path d="M12 13c-3 0-5 2-5 5 0 2 1 3 3 3s2-1 2-2 1-1 2-1 2 0 2 1 0 2 2 2 3-1 3-3c0-3-2-5-5-5z"/>`,
  },
  star: {
    viewBox: '0 0 24 24',
    strokeWidth: 2,
    paths: `<polygon points="12 2 15 9 22 9 17 14 19 21 12 17 5 21 7 14 2 9 9 9 12 2"/>`,
  },
  calendar: {
    viewBox: '0 0 24 24',
    strokeWidth: 2,
    paths: `<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>`,
  },
  food: {
    viewBox: '0 0 24 24',
    strokeWidth: 2,
    paths: `<path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/>`,
  },
  transport: {
    viewBox: '0 0 24 24',
    strokeWidth: 2,
    paths: `<path d="M5 17h14M5 17a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/><line x1="6" y1="11" x2="18" y2="11"/>`,
  },
  shop: {
    viewBox: '0 0 24 24',
    strokeWidth: 2,
    paths: `<path d="M3 9l1.5-5h15L21 9"/><path d="M3 9v11a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V9"/><path d="M9 21V13h6v8"/>`,
  },
  play: {
    viewBox: '0 0 24 24',
    strokeWidth: 2,
    paths: `<polygon points="6 4 20 12 6 20 6 4"/>`,
  },
  medical: {
    viewBox: '0 0 24 24',
    strokeWidth: 2,
    paths: `<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7z"/><line x1="12" y1="6" x2="12" y2="12"/><line x1="9" y1="9" x2="15" y2="9"/>`,
  },
  book: {
    viewBox: '0 0 24 24',
    strokeWidth: 2,
    paths: `<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>`,
  },
  trash: {
    viewBox: '0 0 24 24',
    strokeWidth: 2,
    paths: `<polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/>`,
  },
  edit: {
    viewBox: '0 0 24 24',
    strokeWidth: 2,
    paths: `<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4z"/>`,
  },
  share: {
    viewBox: '0 0 24 24',
    strokeWidth: 2,
    paths: `<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>`,
  },
  download: {
    viewBox: '0 0 24 24',
    strokeWidth: 2,
    paths: `<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>`,
  },
  upload: {
    viewBox: '0 0 24 24',
    strokeWidth: 2,
    paths: `<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>`,
  },
  trend: {
    viewBox: '0 0 24 24',
    strokeWidth: 2,
    paths: `<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>`,
  },
  image: {
    viewBox: '0 0 24 24',
    strokeWidth: 2,
    paths: `<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>`,
  },
  refresh: {
    viewBox: '0 0 24 24',
    strokeWidth: 2,
    paths: `<polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>`,
  },
  search: {
    viewBox: '0 0 24 24',
    strokeWidth: 2,
    paths: `<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>`,
  },
  filter: {
    viewBox: '0 0 24 24',
    strokeWidth: 2,
    paths: `<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>`,
  },
  minus: {
    viewBox: '0 0 24 24',
    strokeWidth: 2,
    paths: `<line x1="5" y1="12" x2="19" y2="12"/>`,
  },
  more: {
    viewBox: '0 0 24 24',
    strokeWidth: 2,
    paths: `<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>`,
  },
  copy: {
    viewBox: '0 0 24 24',
    strokeWidth: 2,
    paths: `<rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>`,
  },
  heart: {
    viewBox: '0 0 24 24',
    strokeWidth: 2,
    paths: `<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>`,
  },
  camera: {
    viewBox: '0 0 24 24',
    strokeWidth: 2,
    paths: `<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>`,
  },
}

/* ============================================================
 * 萌宠猫狗画风 2.5-3px 圆润
 *  - 圆角更大（linecap round + linejoin round）
 *  - 关键图标加小圆点（眼睛、鼻子、爪印）作萌系细节
 * ============================================================ */
const petIcons: Record<string, IconDef> = {
  // 房子上面加一个猫耳小三角
  home: {
    viewBox: '0 0 24 24',
    strokeWidth: 2.5,
    paths: `<path d="M3 11L12 4l9 7v9a1.5 1.5 0 0 1-1.5 1.5h-4.5v-6h-6v6H4.5A1.5 1.5 0 0 1 3 20z"/><path d="M9 4l3-2 3 2" stroke-linejoin="round"/>`,
  },
  // 三条柱但顶部加小圆点（像小爪印）
  stats: {
    viewBox: '0 0 24 24',
    strokeWidth: 2.5,
    paths: `<line x1="4" y1="20" x2="4" y2="11"/><line x1="10" y1="20" x2="10" y2="5"/><line x1="16" y1="20" x2="16" y2="14"/><line x1="22" y1="20" x2="22" y2="8"/><circle cx="4" cy="8" r="1.5"/><circle cx="10" cy="2" r="1.5"/><circle cx="16" cy="11" r="1.5"/><circle cx="22" cy="5" r="1.5"/>`,
  },
  list: {
    viewBox: '0 0 24 24',
    strokeWidth: 2.5,
    paths: `<line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/><circle cx="5" cy="6" r="2"/><circle cx="5" cy="12" r="2"/><circle cx="5" cy="18" r="2"/>`,
  },
  add: {
    viewBox: '0 0 24 24',
    strokeWidth: 3,
    paths: `<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>`,
  },
  check: {
    viewBox: '0 0 24 24',
    strokeWidth: 3,
    paths: `<polyline points="20 6 9 17 4 12"/>`,
  },
  tetris: {
    viewBox: '0 0 24 24',
    strokeWidth: 2.5,
    paths: `<rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="4" rx="1.5"/><rect x="13" y="9" width="4" height="6" rx="1.5"/><rect x="3" y="13" width="6" height="8" rx="1.5"/><rect x="11" y="17" width="10" height="4" rx="1.5"/>`,
  },
  close: {
    viewBox: '0 0 24 24',
    strokeWidth: 2.5,
    paths: `<line x1="7" y1="7" x2="17" y2="17"/><line x1="7" y1="17" x2="17" y2="7"/>`,
  },
  eye: {
    viewBox: '0 0 24 24',
    strokeWidth: 2.5,
    paths: `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/><circle cx="12" cy="11" r="0.8" fill="currentColor" stroke="none"/>`,
  },
  eyeOff: {
    viewBox: '0 0 24 24',
    strokeWidth: 2.5,
    paths: `<path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 4.22-5.5"/><path d="M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>`,
  },
  // 锁上面加一个小狗耳朵
  lock: {
    viewBox: '0 0 24 24',
    strokeWidth: 2.5,
    paths: `<rect x="4" y="11" width="16" height="10" rx="2.5"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/><circle cx="12" cy="16" r="1.2" fill="currentColor" stroke="none"/>`,
  },
  user: {
    viewBox: '0 0 24 24',
    strokeWidth: 2.5,
    paths: `<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/><path d="M9 6c0-1 1-2 1-2.5" stroke-linecap="round"/>`,
  },
  bell: {
    viewBox: '0 0 24 24',
    strokeWidth: 2.5,
    paths: `<path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 20a2 2 0 0 0 4 0"/><circle cx="18" cy="6" r="2"/>`,
  },
  settings: {
    viewBox: '0 0 24 24',
    strokeWidth: 2.5,
    paths: `<circle cx="12" cy="12" r="3.5"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>`,
  },
  chart: {
    viewBox: '0 0 24 24',
    strokeWidth: 2.5,
    paths: `<path d="M3 4v17h18"/><path d="M7 15l4-4 4 4 5-6"/><circle cx="7" cy="15" r="1.5"/><circle cx="11" cy="11" r="1.5"/><circle cx="15" cy="15" r="1.5"/><circle cx="20" cy="9" r="1.5"/>`,
  },
  wallet: {
    viewBox: '0 0 24 24',
    strokeWidth: 2.5,
    paths: `<path d="M19 8a2 2 0 0 0-2-2H5a2 2 0 1 1 0-4h12v3"/><path d="M3 6v12a2 2 0 0 0 2 2h16v-4H10a1.5 1.5 0 1 1 0-3h11"/><circle cx="17" cy="14" r="1.2"/>`,
  },
  arrowRight: {
    viewBox: '0 0 24 24',
    strokeWidth: 2.5,
    paths: `<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>`,
  },
  arrowLeft: {
    viewBox: '0 0 24 24',
    strokeWidth: 2.5,
    paths: `<line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>`,
  },
  pencil: {
    viewBox: '0 0 24 24',
    strokeWidth: 2.5,
    paths: `<path d="M12 20h8"/><path d="M16 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4z"/>`,
  },
  paw: {
    viewBox: '0 0 24 24',
    strokeWidth: 2.5,
    paths: `<ellipse cx="11" cy="5" rx="2.2" ry="2.8"/><ellipse cx="18" cy="9" rx="2.2" ry="2.8"/><ellipse cx="4" cy="9" rx="2.2" ry="2.8"/><ellipse cx="7" cy="14" rx="2.2" ry="2.8"/><path d="M12 13c-3 0-5 2-5 5 0 2 1 3 3 3 1.5 0 1.5-1 2-1s.5 1 2 1c2 0 3-1 3-3 0-3-2-5-5-5z" fill="currentColor" opacity="0.2"/><path d="M12 13c-3 0-5 2-5 5 0 2 1 3 3 3 1.5 0 1.5-1 2-1s.5 1 2 1c2 0 3-1 3-3 0-3-2-5-5-5z"/>`,
  },
  star: {
    viewBox: '0 0 24 24',
    strokeWidth: 2.5,
    paths: `<polygon points="12 2 14.5 9 22 9 16 14 18 21 12 17 6 21 8 14 2 9 9.5 9 12 2" fill="currentColor" fill-opacity="0.15"/>`,
  },
  calendar: {
    viewBox: '0 0 24 24',
    strokeWidth: 2.5,
    paths: `<rect x="3" y="5" width="18" height="16" rx="2.5"/><line x1="16" y1="3" x2="16" y2="7"/><line x1="8" y1="3" x2="8" y2="7"/><line x1="3" y1="11" x2="21" y2="11"/><circle cx="12" cy="15" r="1.5" fill="currentColor" stroke="none"/>`,
  },
  food: {
    viewBox: '0 0 24 24',
    strokeWidth: 2.5,
    paths: `<path d="M3 11h17v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><line x1="6" y1="3" x2="6" y2="6"/><line x1="10" y1="3" x2="10" y2="6"/><line x1="14" y1="3" x2="14" y2="6"/><path d="M20 11V8a2 2 0 0 0-2-2h-1v3"/>`,
  },
  transport: {
    viewBox: '0 0 24 24',
    strokeWidth: 2.5,
    paths: `<path d="M5 17h14"/><path d="M5 17a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/><line x1="6" y1="11" x2="18" y2="11"/>`,
  },
  shop: {
    viewBox: '0 0 24 24',
    strokeWidth: 2.5,
    paths: `<path d="M3 10l1.5-5h15L21 10"/><path d="M3 10v10a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V10"/><path d="M9 21V13h6v8"/>`,
  },
  play: {
    viewBox: '0 0 24 24',
    strokeWidth: 2.5,
    paths: `<polygon points="6 4 20 12 6 20 6 4" fill="currentColor" fill-opacity="0.15"/>`,
  },
  medical: {
    viewBox: '0 0 24 24',
    strokeWidth: 2.5,
    paths: `<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7z"/><line x1="12" y1="6" x2="12" y2="12"/><line x1="9" y1="9" x2="15" y2="9"/>`,
  },
  book: {
    viewBox: '0 0 24 24',
    strokeWidth: 2.5,
    paths: `<path d="M3 4h6a3 3 0 0 1 3 3v14a3 3 0 0 0-3-3H3z"/><path d="M21 4h-6a3 3 0 0 0-3 3v14a3 3 0 0 1 3-3h6z"/><circle cx="6" cy="9" r="0.8" fill="currentColor" stroke="none"/><circle cx="18" cy="9" r="0.8" fill="currentColor" stroke="none"/>`,
  },
  trash: {
    viewBox: '0 0 24 24',
    strokeWidth: 2.5,
    paths: `<polyline points="4 6 6 6 20 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/>`,
  },
  edit: {
    viewBox: '0 0 24 24',
    strokeWidth: 2.5,
    paths: `<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4z"/>`,
  },
  share: {
    viewBox: '0 0 24 24',
    strokeWidth: 2.5,
    paths: `<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>`,
  },
  download: {
    viewBox: '0 0 24 24',
    strokeWidth: 2.5,
    paths: `<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>`,
  },
  upload: {
    viewBox: '0 0 24 24',
    strokeWidth: 2.5,
    paths: `<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>`,
  },
  trend: {
    viewBox: '0 0 24 24',
    strokeWidth: 2.5,
    paths: `<polyline points="22 6 13 15 8 10 1 18"/><polyline points="16 6 22 6 22 12"/>`,
  },
  image: {
    viewBox: '0 0 24 24',
    strokeWidth: 2.5,
    paths: `<rect x="3" y="3" width="18" height="18" rx="2.5"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>`,
  },
  refresh: {
    viewBox: '0 0 24 24',
    strokeWidth: 2.5,
    paths: `<polyline points="22 4 22 10 16 10"/><polyline points="2 20 2 14 8 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L22 10M2 14l4.64 4.36A9 9 0 0 0 20.49 15"/>`,
  },
  search: {
    viewBox: '0 0 24 24',
    strokeWidth: 2.5,
    paths: `<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>`,
  },
  filter: {
    viewBox: '0 0 24 24',
    strokeWidth: 2.5,
    paths: `<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>`,
  },
  minus: {
    viewBox: '0 0 24 24',
    strokeWidth: 2.5,
    paths: `<line x1="5" y1="12" x2="19" y2="12"/>`,
  },
  more: {
    viewBox: '0 0 24 24',
    strokeWidth: 2.5,
    paths: `<circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/><circle cx="5" cy="12" r="1.5"/>`,
  },
}

/* ============================================================
 * 手绘漫画画风 1.8-2px 抖动
 *  - path 故意偏移（cubic bezier 加微噪声）
 *  - 多用弧线、波浪线
 * ============================================================ */
const comicIcons: Record<string, IconDef> = {
  home: {
    viewBox: '0 0 24 24',
    strokeWidth: 1.8,
    paths: `<path d="M3.5 11.5c2.5-2.5 5.5-5 8.5-7.5 3 2.5 6 5 8.5 7.5V20a1.2 1.2 0 0 1-1.2 1H14v-6.5H10V21H4.7a1.2 1.2 0 0 1-1.2-1z"/>`,
  },
  stats: {
    viewBox: '0 0 24 24',
    strokeWidth: 1.8,
    paths: `<path d="M4 20q-0.5 0-0.5-0.5V11q0-0.5 0.5-0.5t0.5 0.5v8.5z"/><path d="M10 20q-0.5 0-0.5-0.5V5q0-0.5 0.5-0.5t0.5 0.5v14.5z"/><path d="M16 20q-0.5 0-0.5-0.5V15q0-0.5 0.5-0.5t0.5 0.5v4.5z"/><path d="M22 20q-0.5 0-0.5-0.5V8q0-0.5 0.5-0.5t0.5 0.5v11.5z"/>`,
  },
  list: {
    viewBox: '0 0 24 24',
    strokeWidth: 1.8,
    paths: `<path d="M8.5 6Q9 5.5 9.5 6h11.5q0.5 0 0.5 0.5t-0.5 0.5H9.5Q9 7 8.5 6.5T8.5 6z"/><path d="M8.5 12Q9 11.5 9.5 12h11.5q0.5 0 0.5 0.5t-0.5 0.5H9.5Q9 13 8.5 12.5T8.5 12z"/><path d="M8.5 18Q9 17.5 9.5 18h11.5q0.5 0 0.5 0.5t-0.5 0.5H9.5Q9 19 8.5 18.5T8.5 18z"/><circle cx="4.5" cy="6" r="1"/><circle cx="4.5" cy="12" r="1"/><circle cx="4.5" cy="18" r="1"/>`,
  },
  add: {
    viewBox: '0 0 24 24',
    strokeWidth: 2,
    paths: `<path d="M12 5.2q0.4-0.3 0.5 0t0 1.5v10.5q0 0.8-0.5 0.5t-0.5-0.5V6.7q0-1 0.5-1.5z"/><path d="M5.2 12q-0.3-0.4 0-0.5t1.5 0h10.5q0.8 0 0.5 0.5t-0.5 0.5H6.7q-1 0-1.5-0.5z"/>`,
  },
  check: {
    viewBox: '0 0 24 24',
    strokeWidth: 2.2,
    paths: `<path d="M4 12.2q-0.3-0.4 0-0.5t0.5 0l4.5 4.5q0.2 0.2 0.5 0L19.5 6.2q0.3-0.3 0.5 0t0 0.5l-10 10.2q-0.3 0.3-0.5 0z"/>`,
  },
  tetris: {
    viewBox: '0 0 24 24',
    strokeWidth: 2,
    paths: `<path d="M3.5 3.5q-0.5 0-0.5 0.5v7q0 0.5 0.5 0.5h7q0.5 0 0.5-0.5v-7q0-0.5-0.5-0.5zM13.5 3.5q-0.5 0-0.5 0.5v3q0 0.5 0.5 0.5h7q0.5 0 0.5-0.5v-3q0-0.5-0.5-0.5zM13.5 9.5q-0.5 0-0.5 0.5v5q0 0.5 0.5 0.5h3q0.5 0 0.5-0.5v-5q0-0.5-0.5-0.5zM3.5 13.5q-0.5 0-0.5 0.5v6q0 0.5 0.5 0.5h5q0.5 0 0.5-0.5v-6q0-0.5-0.5-0.5zM11.5 17.5q-0.5 0-0.5 0.5v2q0 0.5 0.5 0.5h9q0.5 0 0.5-0.5v-2q0-0.5-0.5-0.5z"/>`,
  },
  close: {
    viewBox: '0 0 24 24',
    strokeWidth: 1.8,
    paths: `<path d="M6.5 6.5q-0.4-0.3 0-0.5t0.5 0l10.5 10.5q0.3 0.3 0 0.5t-0.5 0L6.5 6.5z"/><path d="M6 17q-0.3-0.4 0-0.5t0.5 0L17 6.5q0.3-0.3 0.5 0t0 0.5L6.5 17.5q-0.3 0.3-0.5 0z"/>`,
  },
  eye: {
    viewBox: '0 0 24 24',
    strokeWidth: 1.8,
    paths: `<path d="M1.5 12q0-0.4 0.5-0.8C4.2 9 7.8 4.5 12 4.5s7.8 4.5 10 6.7q0.5 0.4 0.5 0.8t-0.5 0.8C19.8 15 16.2 19.5 12 19.5s-7.8-4.5-10-6.7q-0.5-0.4-0.5-0.8z"/><circle cx="12" cy="12" r="3"/>`,
  },
  eyeOff: {
    viewBox: '0 0 24 24',
    strokeWidth: 1.8,
    paths: `<path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 4.22-5.5"/><path d="M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><path d="M14.12 14.12A3 3 0 1 1 9.88 9.88"/><path d="M1.2 1.2q-0.3-0.3 0-0.5t0.5 0l21.4 21.4q0.3 0.3 0 0.5t-0.5 0z"/>`,
  },
  lock: {
    viewBox: '0 0 24 24',
    strokeWidth: 1.8,
    paths: `<rect x="3.2" y="11" width="17.6" height="10.5" rx="2.5"/><path d="M7.2 11V7q0-4.8 4.8-4.8t4.8 4.8v4"/>`,
  },
  user: {
    viewBox: '0 0 24 24',
    strokeWidth: 1.8,
    paths: `<path d="M19.5 21q0.5 0 0.5-0.5v-1.5q0-4-4-4H8q-4 0-4 4v1.5q0 0.5 0.5 0.5z"/><circle cx="12" cy="7" r="4"/>`,
  },
  bell: {
    viewBox: '0 0 24 24',
    strokeWidth: 1.8,
    paths: `<path d="M5.5 16q-0.3 0 0-0.5t0.5-0.5h12q0.3 0 0.5 0.5t0 0.5z"/><path d="M6 15V11q0-6 6-6t6 6v4"/><path d="M10 20q0 2 2 2t2-2"/>`,
  },
  settings: {
    viewBox: '0 0 24 24',
    strokeWidth: 1.8,
    paths: `<circle cx="12" cy="12" r="3"/><path d="M19.4 15q0.4 0 0.3 0.5t-0.3 0.5l-1 1q-0.4 0.4-1 0.4t-1-0.4l-0.5-0.5q-0.4-0.4-1-0.3t-0.7 0.7V19q0 0.5-0.5 0.5h-2q-0.5 0-0.5-0.5v-1.7q0-0.5-0.7-0.7t-1 0.3l-0.5 0.5q-0.4 0.4-1 0.4t-1-0.4l-1-1q-0.4-0.4-0.4-1t0.4-1l0.5-0.5q0.4-0.4 0.3-1t-0.7-0.7H5q-0.5 0-0.5-0.5v-2q0-0.5 0.5-0.5h1.7q0.5 0 0.7-0.7t-0.3-1L6.7 6.4q-0.4-0.4-0.4-1t0.4-1l1-1q0.4-0.4 1-0.4t1 0.4l0.5 0.5q0.4 0.4 1 0.3t0.7-0.7V3q0-0.5 0.5-0.5h2q0.5 0 0.5 0.5v1.7q0 0.5 0.7 0.7t1-0.3l0.5-0.5q0.4-0.4 1-0.4t1 0.4l1 1q0.4 0.4 0.4 1t-0.4 1L17.7 7.2q-0.4 0.4-0.3 1t0.7 0.7H20q0.5 0 0.5 0.5v2q0 0.5-0.5 0.5h-1.7q-0.5 0-0.7 0.7t0.3 1z"/>`,
  },
  chart: {
    viewBox: '0 0 24 24',
    strokeWidth: 1.8,
    paths: `<path d="M3 3.5q-0.3-0.4 0-0.5t0.5 0v17q0 0.5 0.5 0.5h17q0.3 0 0.3 0.5t-0.3 0.5z"/><path d="M7 14q-0.4 0.3-0.5 0t0-0.5l4-4q0.3-0.4 0.5 0t0 0.5l-4 4z"/><path d="M11 11q-0.4 0.3-0.5 0t0-0.5l4 4q0.3 0.3 0 0.5t-0.5 0z"/><path d="M16 10q-0.4-0.3 0-0.5t0.5 0l4-4q0.3-0.4 0.5 0t0 0.5l-4 4z"/>`,
  },
  wallet: {
    viewBox: '0 0 24 24',
    strokeWidth: 1.8,
    paths: `<path d="M19 8q0-2-2-2H5q-2 0-2-2t2-2h12v3"/><path d="M3 6v12q0 2 2 2h16v-4H10q-1.5 0-1.5-1.5t1.5-1.5h11"/><circle cx="17" cy="14" r="1"/>`,
  },
  arrowRight: {
    viewBox: '0 0 24 24',
    strokeWidth: 1.8,
    paths: `<path d="M5 12q-0.3-0.3 0-0.5t0.5 0h13q0.3 0 0.3 0.5t-0.3 0.5z"/><path d="M12 5q-0.3-0.3 0-0.5t0.5 0l7 7q0.3 0.3 0 0.5t-0.5 0z"/><path d="M12 19q-0.3 0.3 0 0.5t0.5 0l7-7q0.3-0.3 0-0.5t-0.5 0z"/>`,
  },
  arrowLeft: {
    viewBox: '0 0 24 24',
    strokeWidth: 1.8,
    paths: `<path d="M19 12q0.3-0.3 0-0.5t-0.5 0H5.5q-0.3 0-0.3 0.5t0.3 0.5z"/><path d="M12 5q0.3-0.3 0-0.5t-0.5 0l-7 7q-0.3 0.3 0 0.5t0.5 0z"/><path d="M12 19q0.3 0.3 0 0.5t-0.5 0l-7-7q-0.3-0.3 0-0.5t0.5 0z"/>`,
  },
  pencil: {
    viewBox: '0 0 24 24',
    strokeWidth: 1.8,
    paths: `<path d="M12 20q-0.4-0.3 0-0.5t0.5 0h8.5q0.3 0 0.3 0.5t-0.3 0.5z"/><path d="M16 3.5q-0.3-0.4 0-0.5t0.5 0l4 4q0.3 0.3 0 0.5t-0.5 0z"/><path d="M16 3.5q-0.3-0.3-0.5 0t0 0.5L7 19q-0.3 0.3-0.5 0t0-0.5z"/><path d="M3 20q-0.4 0 0-0.5t0.5 0L7 19q0.3-0.3 0.5 0t0 0.5z"/>`,
  },
  paw: {
    viewBox: '0 0 24 24',
    strokeWidth: 1.8,
    paths: `<ellipse cx="11" cy="5" rx="2" ry="2.5"/><ellipse cx="18" cy="9" rx="2" ry="2.5"/><ellipse cx="4" cy="9" rx="2" ry="2.5"/><ellipse cx="7" cy="14" rx="2" ry="2.5"/><path d="M12 13q-5 0-5 5 0 3 3 3 2 0 2-1 1 1 2 1 3 0 3-3 0-5-5-5z"/>`,
  },
  star: {
    viewBox: '0 0 24 24',
    strokeWidth: 1.8,
    paths: `<polygon points="12 2.5 14.6 9 22 9.4 16.2 13.8 18.3 21 12 16.8 5.7 21 7.8 13.8 2 9.4 9.4 9 12 2.5"/>`,
  },
  calendar: {
    viewBox: '0 0 24 24',
    strokeWidth: 1.8,
    paths: `<rect x="3" y="4.5" width="18" height="17" rx="2"/><path d="M16 2.5q-0.3-0.3 0-0.5t0.5 0v4q0 0.3-0.5 0.3t-0.5-0.3z"/><path d="M8 2.5q-0.3-0.3 0-0.5t0.5 0v4q0 0.3-0.5 0.3t-0.5-0.3z"/><path d="M3 10.5q-0.3-0.3 0-0.5t0.5 0h17q0.3 0 0.3 0.5t-0.3 0.5z"/>`,
  },
  food: {
    viewBox: '0 0 24 24',
    strokeWidth: 1.8,
    paths: `<path d="M3 11q-0.3-0.3 0-0.5t0.5 0h17q0.3 0 0.3 0.5t-0.3 0.5z"/><path d="M3 11v9q0 2 2 2h14q2 0 2-2v-9"/><path d="M6 1.5q-0.3-0.3 0-0.5t0.5 0v4q0 0.3-0.5 0.3t-0.5-0.3z"/><path d="M10 1.5q-0.3-0.3 0-0.5t0.5 0v4q0 0.3-0.5 0.3t-0.5-0.3z"/><path d="M14 1.5q-0.3-0.3 0-0.5t0.5 0v4q0 0.3-0.5 0.3t-0.5-0.3z"/><path d="M19 11V8q0-2 2-2t2 2v3"/>`,
  },
  transport: {
    viewBox: '0 0 24 24',
    strokeWidth: 1.8,
    paths: `<path d="M5 17q-0.3-0.3 0-0.5t0.5 0h13q0.3 0 0.3 0.5t-0.3 0.5z"/><path d="M5 17q-2 0-2-2V8q0-2 2-2h14q2 0 2 2v7q0 2-2 2"/><circle cx="7.5" cy="17" r="1.8"/><circle cx="16.5" cy="17" r="1.8"/><path d="M6 11q-0.3-0.3 0-0.5t0.5 0h11q0.3 0 0.3 0.5t-0.3 0.5z"/>`,
  },
  shop: {
    viewBox: '0 0 24 24',
    strokeWidth: 1.8,
    paths: `<path d="M3 9q-0.3 0 0-0.5t0.5-0.5L5 3q0.2-0.5 0.5 0t0.5 0h13q0.2-0.5 0.5 0t0.5 0L21 8q0.3 0 0.3 0.5t-0.3 0.5z"/><path d="M3 9v11q0 1 1 1h16q1 0 1-1V9"/><path d="M9 21V13q-0.3-0.3 0-0.5t0.5 0h5q0.3-0.3 0.5 0t0 0.5v8"/>`,
  },
  play: {
    viewBox: '0 0 24 24',
    strokeWidth: 1.8,
    paths: `<polygon points="6.5 4.5 19.5 12 6.5 19.5 6.5 4.5"/>`,
  },
  medical: {
    viewBox: '0 0 24 24',
    strokeWidth: 1.8,
    paths: `<path d="M19 14q0.3 0.3 0 0.5t-0.5 0l-7 7q-0.3 0.3-0.5 0t0-0.5z"/><path d="M3 9q-0.4-0.4 0-0.5C5 6 7 4 9 4t3 1.5q1-1.5 3-1.5t6 4.5q0.4 0.1 0 0.5t-0.5 0C18 4.5 16 4 14 4t-2 2q-1 2-2 2T9 5C7 4 5 4.5 3 9z"/><path d="M12 6q-0.3-0.3 0-0.5t0.5 0v6q0 0.3-0.5 0.3t-0.5-0.3z"/><path d="M9 9q-0.3-0.3 0-0.5t0.5 0h6q0.3 0 0.3 0.5t-0.3 0.5z"/>`,
  },
  book: {
    viewBox: '0 0 24 24',
    strokeWidth: 1.8,
    paths: `<path d="M2 3.5q-0.3-0.3 0-0.5t0.5 0h6q3.5 0 3.5 4v14q0 0.5-0.5 0t-0.5-0.5q-0.5-2.5-2.5-2.5H2.5q-0.3 0-0.3-0.5t0.3-0.5z"/><path d="M22 3.5q0.3-0.3 0-0.5t-0.5 0h-6q-3.5 0-3.5 4v14q0 0.5 0.5 0t0.5-0.5q0.5-2.5 2.5-2.5h5.5q0.3 0 0.3-0.5t-0.3-0.5z"/>`,
  },
  trash: {
    viewBox: '0 0 24 24',
    strokeWidth: 1.8,
    paths: `<path d="M3 6q-0.3-0.3 0-0.5t0.5 0h17q0.3 0 0.3 0.5t-0.3 0.5z"/><path d="M19 6l-1 14q0 2-2 2H8q-2 0-2-2L5 6"/><path d="M10 11q-0.3-0.3 0-0.5t0.5 0v6q0 0.3-0.5 0.3t-0.5-0.3z"/><path d="M14 11q-0.3-0.3 0-0.5t0.5 0v6q0 0.3-0.5 0.3t-0.5-0.3z"/><path d="M9 6V4q0-2 2-2h2q2 0 2 2v2"/>`,
  },
  edit: {
    viewBox: '0 0 24 24',
    strokeWidth: 1.8,
    paths: `<path d="M11 4q-0.3-0.3 0-0.5t0.5 0H4q-2 0-2 2v14q0 2 2 2h14q2 0 2-2v-7"/><path d="M18.5 2.5q-0.3-0.4 0-0.5t0.5 0l3 3q0.3 0.3 0 0.5t-0.5 0z"/><path d="M18.5 2.5q-0.3-0.3-0.5 0t0 0.5L7 19q-0.3 0.3-0.5 0t0-0.5z"/><path d="M3 20q-0.4 0 0-0.5t0.5 0L7 19q0.3-0.3 0.5 0t0 0.5z"/>`,
  },
  share: {
    viewBox: '0 0 24 24',
    strokeWidth: 1.8,
    paths: `<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.59 13.51q-0.3-0.3 0-0.5t0.5 0l6.83 3.98q0.3 0.3 0 0.5t-0.5 0z"/><path d="M15.41 6.51q-0.3-0.3 0-0.5t0.5 0L8.59 10.49q-0.3 0.3 0 0.5t0.5 0z"/>`,
  },
  download: {
    viewBox: '0 0 24 24',
    strokeWidth: 1.8,
    paths: `<path d="M21 15q-0.3-0.3 0-0.5t0.5 0v4q0 2-2 2H5q-2 0-2-2v-4"/><path d="M7 10q-0.3-0.3 0-0.5t0.5 0l4.5 4.5q0.2 0.2 0.5 0L17 9.5q0.3-0.3 0.5 0t0 0.5l-5 5q-0.3 0.3-0.5 0z"/><path d="M12 3q-0.3-0.3 0-0.5t0.5 0v12q0 0.3-0.5 0.3t-0.5-0.3z"/>`,
  },
  upload: {
    viewBox: '0 0 24 24',
    strokeWidth: 1.8,
    paths: `<path d="M21 15q-0.3-0.3 0-0.5t0.5 0v4q0 2-2 2H5q-2 0-2-2v-4"/><path d="M17 8q0.3-0.3 0-0.5t-0.5 0l-4.5-4.5q-0.2-0.2-0.5 0L7 7.5q-0.3 0.3-0.5 0t0-0.5l5-5q0.3-0.3 0.5 0z"/><path d="M12 3q-0.3-0.3 0-0.5t0.5 0v12q0 0.3-0.5 0.3t-0.5-0.3z"/>`,
  },
  trend: {
    viewBox: '0 0 24 24',
    strokeWidth: 1.8,
    paths: `<path d="M22 6q-0.3-0.3 0-0.5t0.5 0v4q0 0.3-0.5 0.3t-0.5-0.3z"/><path d="M17 6q-0.3-0.3 0-0.5t0.5 0h5q0.3 0 0.3 0.5t-0.3 0.5z"/><path d="M22 6q-0.3-0.3-0.5 0t0 0.5l-8.5 9.5q-0.3 0.3-0.5 0T12.5 15.5l-4-4q-0.3-0.3-0.5 0t0 0.5L1.5 18.5q-0.3 0.3 0 0.5t0.5 0z"/>`,
  },
  image: {
    viewBox: '0 0 24 24',
    strokeWidth: 1.8,
    paths: `<rect x="3" y="3.5" width="18" height="17" rx="2.5"/><circle cx="9" cy="9" r="1.5"/><path d="M21 15q-0.3-0.3-0.5 0t0 0.5L16 20q-0.3 0.3-0.5 0t0-0.5L11 15q-0.3-0.3-0.5 0t0 0.5L5.5 20.5q-0.3 0.3 0 0.5t0.5 0z"/>`,
  },
  refresh: {
    viewBox: '0 0 24 24',
    strokeWidth: 1.8,
    paths: `<path d="M22 4q-0.3-0.3 0-0.5t0.5 0v6q0 0.3-0.5 0.3t-0.5-0.3z"/><path d="M22 4q-0.3-0.3-0.5 0t0 0.5l-3.4 3.4q-0.3 0.3-0.5 0t0-0.5z"/><path d="M2 20q0.3 0.3 0 0.5t-0.5 0v-6q0-0.3 0.5-0.3t0.5 0.3z"/><path d="M2 20q0.3 0.3 0.5 0t0-0.5l3.4-3.4q0.3-0.3 0.5 0t0 0.5z"/><path d="M3.51 9q-0.3 0 0-0.5t0.5 0C5 6 8 4 12 4q4 0 7 2.5"/><path d="M20.49 15q0.3 0 0 0.5t-0.5 0C19 18 16 20 12 20q-4 0-7-2.5"/>`,
  },
  search: {
    viewBox: '0 0 24 24',
    strokeWidth: 1.8,
    paths: `<circle cx="11" cy="11" r="7.5"/><path d="M21 21q-0.3 0.3-0.5 0t0-0.5l-4.35-4.35q-0.3-0.3 0-0.5t0.5 0z"/>`,
  },
  filter: {
    viewBox: '0 0 24 24',
    strokeWidth: 1.8,
    paths: `<path d="M22 3q-0.3-0.3 0-0.5t0.5 0L14 12.46q-0.3 0.3-0.5 0T13.5 12V19q0 0.3-0.5 0.5T10 21V12.46q0-0.3-0.5-0.3T9 12L2 2.5q-0.3 0 0 0t0.5 0z"/>`,
  },
  minus: {
    viewBox: '0 0 24 24',
    strokeWidth: 2,
    paths: `<path d="M5 12q-0.3-0.3 0-0.5t0.5 0h13q0.3 0 0.3 0.5t-0.3 0.5z"/>`,
  },
  more: {
    viewBox: '0 0 24 24',
    strokeWidth: 1.8,
    paths: `<circle cx="12" cy="12" r="1.2"/><circle cx="19" cy="12" r="1.2"/><circle cx="5" cy="12" r="1.2"/>`,
  },
}

/* ============================================================
 * 暴露的 API
 * ============================================================ */
const iconMap: Record<ThemeSet, Record<string, IconDef>> = {
  standard: standardIcons,
  onepiece: comicIcons,  // 历史命名沿用：comicIcons 实际是海贼王图标
  family: standardIcons,  // 家人温馨主题：图标与标准主题一致
}

export function getIcon(name: string, theme: ThemeSet = 'standard'): IconDef {
  return iconMap[theme][name] || standardIcons[name] || standardIcons.star
}

export function getAllIconNames(): string[] {
  return Object.keys(standardIcons)
}
