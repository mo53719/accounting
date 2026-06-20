import { createRouter, createWebHashHistory } from 'vue-router'
import { getLocal } from '../utils/storage'
import { waitForBootstrap } from '../utils/idb'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      redirect: '/entry',
    },
    {
      path: '/entry',
      name: 'entry',
      component: () => import('../views/EntryView.vue'),
    },
    {
      path: '/home',
      name: 'home',
      component: () => import('../views/HomeView.vue'),
    },
    {
      path: '/add',
      name: 'add',
      component: () => import('../views/AddView.vue'),
    },
    {
      path: '/list',
      name: 'list',
      component: () => import('../views/ListView.vue'),
    },
    {
      path: '/stats',
      name: 'stats',
      component: () => import('../views/StatsView.vue'),
    },
    {
      path: '/report',
      name: 'report',
      component: () => import('../views/ReportView.vue'),
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('../views/SettingsView.vue'),
    },
    {
      path: '/category-manage',
      name: 'category-manage',
      component: () => import('../views/CategoryManageView.vue'),
    },
    {
      path: '/transaction-count',
      name: 'transaction-count',
      component: () => import('../views/TransactionCountView.vue'),
    },
    {
      path: '/persistent-days',
      name: 'persistent-days',
      component: () => import('../views/PersistentDaysView.vue'),
    },
    {
      path: '/category-usage',
      name: 'category-usage',
      component: () => import('../views/CategoryUsageView.vue'),
    },
    {
      path: '/budget',
      name: 'budget',
      component: () => import('../views/BudgetView.vue'),
    },
    {
      path: '/auto-record',
      name: 'auto-record',
      component: () => import('../views/AutoRecordView.vue'),
    },
    {
      path: '/period-books',
      name: 'period-books',
      component: () => import('../views/PeriodBooksView.vue'),
    },
    {
      path: '/tax-records',
      name: 'tax-records',
      component: () => import('../views/TaxRecordsView.vue'),
    },
    {
      path: '/search',
      name: 'search',
      component: () => import('../views/SearchView.vue'),
    },
    {
      path: '/lend-borrow',
      name: 'lend-borrow',
      component: () => import('../views/LendBorrowView.vue'),
    },
    {
      path: '/coupons',
      name: 'coupons',
      component: () => import('../views/CouponsView.vue'),
    },
    {
      path: '/tags',
      name: 'tags',
      component: () => import('../views/TagsView.vue'),
    },
    {
      path: '/data-backup',
      name: 'data-backup',
      component: () => import('../views/DataBackupView.vue'),
    },
    {
      path: '/export',
      name: 'export',
      component: () => import('../views/ExportView.vue'),
    },
    {
      path: '/savings-plan',
      name: 'savings-plan',
      component: () => import('../views/SavingsPlanView.vue'),
    },
    {
      path: '/check',
      name: 'check',
      component: () => import('../views/CheckView.vue'),
    },
    {
      path: '/tetris',
      name: 'tetris',
      component: () => import('../views/TetrisView.vue'),
    },
    {
      path: '/games',
      name: 'games',
      component: () => import('../views/GamesView.vue'),
    },
    {
      path: '/reminder',
      name: 'reminder',
      component: () => import('../views/ReminderView.vue'),
    },
    {
      path: '/image-bill',
      name: 'image-bill',
      component: () => import('../views/ImageBillView.vue'),
    },
  ],
})

// 路由守卫：未输入密码不能进入；进入前等 IDB 启动完成（避免 store 还没准备好）
router.beforeEach(async (to, from, next) => {
  // 等 IDB 初始化（最多 5s，由 waitForBootstrap 内部超时保护）
  await waitForBootstrap()
  const bookId = getLocal<string>('bookId')
  if (to.path !== '/entry' && !bookId) {
    next('/entry')
  } else if (to.path === '/entry' && bookId) {
    next('/home')
  } else {
    next()
  }
})

export default router
