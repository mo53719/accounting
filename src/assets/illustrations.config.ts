// 萌宠主题已删除（保留 'onepiece' = 海贼王主题，资源来自 ./images/onepiece/）
// 1) 用户把图片放到 src/assets/images/onepiece/standard/ 下
// 2) 这里导出两套数据：
//    a) illustrationPaths[theme][slot]  ← 固定 slot → 固定文件（用户精细控制）
//    b) ALL_ONEPIECE_URLS              ← 30 张全集 URL，供 useIllustrationPicker 随机抽
//    c) classifyOnePieceFile(file)     ← 按文件名判断用途（hero / mini / corner / pattern）
// 家人主题 'family' 资源来自 ./images/family/（与 onepiece 同根目录）

/**
 * 海贼王主题全部 30 张用户素材（src/assets/images/onepiece/）
 */
const ONEPIECE_FILES = [
  '0520382c40e59bee3adfe2b86fec1658.jpeg',
  '22c9f6721ecab791824520165aac7aef.jpeg',
  '5e0787f9d3d6b7925f4b6fef41f5bdb0_u=2957937532,463602399&fm=253&fmt=auto&app=120&f=JPEG_w=1422&h=800.webp',
  '67198db937f02048714b39da860c90bf.jpg',
  '750bea7b6c41f2a3fad9fc16db206e8e.jpeg',
  'ac74cfd97ef181a6f20a0de0a8558238.jpeg',
  'be04c2d56dc4cd56afd89e502bec823c.jpg',
  'e4ddd3e65ec2d0f3676d3f87bdb3882d.jpg',
  'eca59e79c46f999abc2e8a5ea889f728.jpg',
  't0139419dce33886ae0.jpg',
  't0153f7f4585ab609f9.png',
  't017ecb8788f7c70551.jpg',
  't018ed102d61b99afc9.jpg',
  't01a79fdf70d6727133.jpg',
  't01bdd4a65e81e617a7.jpg',
  't040219453d4ce4694b.jpg',
  't0402e26118e649acd4.jpg',
  't040a013b5ab5939e40.jpg',
  't0428a8d6437cb44608.jpg',
  't043b7bb5d8fcdc811a.jpg',
  't044f83b29e4dda03b5.jpg',
  't04794801e2ea44f775.jpg',
  't04b767bf6e687b5218.jpg',
  't04c31472209bda8ebb.jpg',
  't04cd5180e2b7e9e4e9.jpg',
  't04d0106038c8cc8152.jpg',
  'u=1118057018,3581904531&fm=253&fmt=auto&app=138&f=JPEG.webp',
  'u=3268162122,3573516972&fm=253&fmt=auto&app=120&f=JPEG.webp',
  'u=3903683415,1185613202&fm=253&fmt=auto&app=138&f=JPEG.webp',
  'u=733083204,4215900889&fm=253&fmt=auto&app=120&f=JPEG.webp',
  'v2-f4997f5fd788c59ad6a5553ee6167c1f_r.jpg',
]

/**
 * 按"用途"分类
 * - hero：    卡片底层大图（半透 8%，宽高比大，重复不可）
 * - mini：    角标头像（半透 12%，正方形/小图）
 * - corner：  角落剪影（半透 12%，小图）
 * - pattern： 网点 / 纹理（极淡，可平铺）
 *
 * 这里我们不真正按文件大小区分，运行时使用同一个全集，
 * 渲染时通过 CSS object-fit / size 决定视觉风格。
 * 不同 slot 类型只是"语义分类"，方便组件按类型渲染。
 */
export type IllustrationKind = 'hero' | 'mini' | 'corner' | 'pattern'

const op = (file: string) => new URL(`./images/onepiece/${file}`, import.meta.url).href
const fam = (file: string) => new URL(`./images/family/${file}`, import.meta.url).href

/** 全部 30 张图的 URL */
export const ALL_ONEPIECE_URLS: string[] = ONEPIECE_FILES.map(op)

/**
 * 家人主题照片资源（src/assets/images/family/）
 * 共 31 张。运行时通过 .png?ignore 标记包含 svg/png/jpg/webp。
 */
const FAMILY_FILES = [
  '913a6181-e6c5-488c-96e2-879daaca31fa.jpg',
  'IMG_20190203_200301.jpg',
  'IMG_20190529_192530.jpg',
  'IMG_20200818_172929.jpg',
  'IMG_20200925_163419.jpg',
  'IMG_20201103_122315.jpg',
  'IMG_20211003_103153.jpg',
  'IMG_20230329_142003.jpg',
  'IMG_20240404_143935.jpg',
  'IMG_20240404_144155.jpg',
  'IMG_20240404_144202.jpg',
  'IMG_20240404_144428.jpg',
  'IMG_20240810_161515.jpg',
  'IMG_20240810_161516.jpg',
  'IMG_20240811_160445.jpg',
  'IMG_20240811_161659.jpg',
  'IMG_20240825_174320.jpg',
  'IMG_20250203_143436.jpg',
  'mmexport1632468730466.jpg',
  'mmexport1632468784891.jpg',
  'mmexport1635040884909.jpg',
  'mmexport1635331265276.jpg',
  'mmexport1635427804747.jpg',
  'mmexport1635427808628.jpg',
  'mmexport1635427809867.jpg',
  'mmexport1646044293113.jpg',
  'mmexport1682165069413.png',
  'mmexport1682165071788.png',
  'mmexport1684675135039.jpg',
  'mmexport1684675139294.jpg',
  'mmexport1718350294176.jpg',
]

/** 家人主题全部 URL（随机抽插画用） */
export const ALL_FAMILY_URLS: string[] = FAMILY_FILES.map(fam)

/** 把 URL 还原回文件名前缀（用于按 kind 分类的占位规则） */
export function fileFromUrl(url: string): string {
  if (!url) return ''
  const parts = url.split('/')
  return parts[parts.length - 1] || ''
}

/**
 * 用途分配规则（保持各 slot 视觉风格统一）：
 * - hero (大图暗纹)：前 12 张通常画幅完整、人物居中
 * - mini (角标头像)：14-25 张通常为头像特写
 * - corner (条目剪影)：26-30 张通常为剪影/插画
 * - pattern (网点纹理)：暂时从 0-5 选，可用 .webp 网点
 * 实际用户可自由指定，这里只是默认值。
 */
const HERO_INDICES  = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]
const MINI_INDICES  = [14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25]
const CORNER_INDICES = [26, 27, 28, 29]
const PATTERN_INDICES = [1, 4, 13]  // 选偏纹理的图

export function getOnePieceUrlsByKind(kind: IllustrationKind): string[] {
  switch (kind) {
    case 'hero':    return HERO_INDICES.map(i => ALL_ONEPIECE_URLS[i])
    case 'mini':    return MINI_INDICES.map(i => ALL_ONEPIECE_URLS[i])
    case 'corner':  return CORNER_INDICES.map(i => ALL_ONEPIECE_URLS[i])
    case 'pattern': return PATTERN_INDICES.map(i => ALL_ONEPIECE_URLS[i])
  }
}

/**
 * 家人主题用途分配规则（与海贼王结构一致）：
 * - hero：前 12 张（更宽幅照片）
 * - mini：13-25 张（人物特写）
 * - corner：26-30 张（小图）
 * - pattern：纹理类（暂时复用 1,4,13）
 */
const FAM_HERO_INDICES   = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
const FAM_MINI_INDICES   = [13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25]
const FAM_CORNER_INDICES = [26, 27, 28, 29, 30]
const FAM_PATTERN_INDICES = [1, 4, 13]

export function getFamilyUrlsByKind(kind: IllustrationKind): string[] {
  switch (kind) {
    case 'hero':    return FAM_HERO_INDICES.map(i => ALL_FAMILY_URLS[i])
    case 'mini':    return FAM_MINI_INDICES.map(i => ALL_FAMILY_URLS[i])
    case 'corner':  return FAM_CORNER_INDICES.map(i => ALL_FAMILY_URLS[i])
    case 'pattern': return FAM_PATTERN_INDICES.map(i => ALL_FAMILY_URLS[i])
  }
}

/** 完整资源清单：按主题 × 场景分类（保留给精确控制场景） */
const buildOnePiece = (() => {
  let idx = 0
  const next = (kind: IllustrationKind) => getOnePieceUrlsByKind(kind)[idx++ % getOnePieceUrlsByKind(kind).length]
  return {
    cardExpense:    ALL_ONEPIECE_URLS[0],  // 1: 支出卡主图
    cardIncome:     ALL_ONEPIECE_URLS[3],  // 2: 收入卡主图
    emptyBills:     next('hero'),          // 空账单页
    emptySavings:   next('hero'),          // 空存钱页
    emptyLend:      next('hero'),          // 人情往来空页
    emptyBudget:    next('hero'),          // 空预算页
    stickerCorner:  next('mini'),          // 角标贴纸
    stickerHero:    next('mini'),          // 顶部 hero 贴纸
    themePreview:   next('mini'),          // 主题弹窗预览
    navTabHome:     next('mini'),          // 底部导航 - 首页
    navTabStats:    next('mini'),          // 底部导航 - 统计
    navTabBook:     next('mini'),          // 底部导航 - 账本
    navTabSetting:  next('mini'),          // 底部导航 - 设置
    fabAdd:         next('mini'),          // 中间 + 按钮
    chartBar:       next('hero'),          // 柱状图场景
    chartPie:       next('hero'),          // 饼图场景
    // ====== 报表页 4 张汇总卡（每张有专属插画，固定 slot → 固定文件）======
    reportIncome:   ALL_ONEPIECE_URLS[0],  // 收入
    reportExpense:  ALL_ONEPIECE_URLS[1],  // 支出
    reportBalance:  ALL_ONEPIECE_URLS[2],  // 结余
    reportCount:    ALL_ONEPIECE_URLS[3],  // 笔数
  }
})()

/** 家人主题资源清单：照片类（src/assets/images/family/） */
const buildFamily = (() => {
  let idx = 0
  const next = (kind: IllustrationKind) => getFamilyUrlsByKind(kind)[idx++ % getFamilyUrlsByKind(kind).length]
  return {
    cardExpense:    ALL_FAMILY_URLS[0],   // 支出卡主图
    cardIncome:     ALL_FAMILY_URLS[3],   // 收入卡主图
    emptyBills:     next('hero'),          // 空账单页
    emptySavings:   next('hero'),          // 空存钱页
    emptyLend:      next('hero'),          // 人情往来空页
    emptyBudget:    next('hero'),          // 空预算页
    stickerCorner:  next('mini'),          // 角标贴纸
    stickerHero:    next('mini'),          // 顶部 hero 贴纸
    themePreview:   next('mini'),          // 主题弹窗预览
    navTabHome:     next('mini'),          // 底部导航 - 首页
    navTabStats:    next('mini'),          // 底部导航 - 统计
    navTabBook:     next('mini'),          // 底部导航 - 账本
    navTabSetting:  next('mini'),          // 底部导航 - 设置
    fabAdd:         next('mini'),          // 中间 + 按钮
    chartBar:       next('hero'),          // 柱状图场景
    chartPie:       next('hero'),          // 饼图场景
    // ====== 报表页 4 张汇总卡（每张有专属插画，固定 slot → 固定文件）======
    reportIncome:   ALL_FAMILY_URLS[0],    // 收入
    reportExpense:  ALL_FAMILY_URLS[1],    // 支出
    reportBalance:  ALL_FAMILY_URLS[2],    // 结余
    reportCount:    ALL_FAMILY_URLS[3],    // 笔数
  }
})()

/** 标准主题：无插画 */
const empty = () => ''

export const illustrationPaths = {
  standard: {
    cardExpense:    empty(),
    cardIncome:     empty(),
    emptyBills:     empty(),
    emptySavings:   empty(),
    emptyLend:      empty(),
    emptyBudget:    empty(),
    stickerCorner:  empty(),
    stickerHero:    empty(),
    themePreview:   empty(),
    navTabHome:     empty(),
    navTabStats:    empty(),
    navTabBook:     empty(),
    navTabSetting:  empty(),
    fabAdd:         empty(),
    chartBar:       empty(),
    chartPie:       empty(),
    // 报表页 4 张汇总卡：标准主题无插画
    reportIncome:   empty(),
    reportExpense:  empty(),
    reportBalance:  empty(),
    reportCount:    empty(),
  },
  onepiece: buildOnePiece,
  // 家人温馨主题：照片插图（来自 src/assets/images/family/）
  family: buildFamily,
} as const

export type ThemeName = 'standard' | 'onepiece' | 'family'
export type IllustrationSlot =
  | 'cardExpense' | 'cardIncome'
  | 'emptyBills' | 'emptySavings' | 'emptyLend' | 'emptyBudget'
  | 'stickerCorner' | 'stickerHero' | 'themePreview'
  | 'navTabHome' | 'navTabStats' | 'navTabBook' | 'navTabSetting'
  | 'fabAdd' | 'chartBar' | 'chartPie'
  // 报表页 4 张汇总卡（收入 / 支出 / 结余 / 笔数）
  | 'reportIncome' | 'reportExpense' | 'reportBalance' | 'reportCount'

export function getIllustrationPath(theme: ThemeName, slot: IllustrationSlot): string {
  const map = illustrationPaths[theme] as Record<string, string>
  return map?.[slot] || ''
}

/** 取某主题所有有效 URL 数组（用于轮询） */
export function getIllustrationPaths(theme: ThemeName): string[] {
  const map = illustrationPaths[theme] as Record<string, string>
  if (!map) return []
  return Object.values(map).filter(v => !!v)
}

/** 探测图片是否实际可加载 */
export function probeImage(url: string): Promise<boolean> {
  if (!url) return Promise.resolve(false)
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve(true)
    img.onerror = () => resolve(false)
    img.src = url
  })
}

/* 用 v-for 引用以保证 Tree-shaking 不会裁掉 ONEPIECE_FILES 中的图片 */
const _keepRefs: any[] = []
void ONEPIECE_FILES
void _keepRefs
