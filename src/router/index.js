import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/login',
      meta: { requiresAuth: false }
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { requiresAuth: false, title: '登录' }
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: () => import('@/views/ForgotPasswordView.vue'),
      meta: { requiresAuth: false, title: '忘记密码' }
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/RegisterView.vue'),
      meta: { requiresAuth: false, title: '注册' }
    },
    // ========== 需要登录认证的路由 ==========
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('@/views/DashboardView.vue'),
      meta: { requiresAuth: true, title: '仪表板' }
    },
    {
      path: '/trade-buy',
      name: 'trade-buy',
      component: () => import('@/views/TradeBuyView.vue'),
      meta: { requiresAuth: true, title: '买入交易' }
    },
    {
      path: '/trade-sell',
      name: 'trade-sell',
      component: () => import('@/views/TradeSellView.vue'),
      meta: { requiresAuth: true, title: '卖出交易' }
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('@/views/ProfileView.vue'),
      meta: { requiresAuth: true, title: '个人资料' }
    },
    {
      path: '/transaction-history',
      name: 'transaction-history',
      component: () => import('@/views/TransactionHistoryView.vue'),
      meta: { requiresAuth: true, title: '交易记录' }
    },
    {
      path: '/notifications',
      name: 'notifications',
      component: () => import('@/views/NotificationsView.vue'),
      meta: { requiresAuth: true, title: '通知中心' }
    },
    {
      path: '/points-mall',
      name: 'points-mall',
      component: () => import('@/views/PointsMallView.vue'),
      meta: { requiresAuth: true, title: '积分商城' }
    },
    {
      path: '/my-wallet',
      name: 'my-wallet',
      component: () => import('@/views/MyWalletView.vue'),
      meta: { requiresAuth: true, title: '我的钱包' }
    },
    {
      path: '/withdraw',
      name: 'withdraw',
      component: () => import('@/views/WithdrawView.vue'),
      meta: { requiresAuth: true, title: '提现' }
    },
    {
      path: '/system-announcements',
      name: 'system-announcements',
      component: () => import('@/views/SystemAnnouncementsView.vue'),
      meta: { requiresAuth: true, title: '系统公告' }
    },
    {
      path: '/payment-account',
      name: 'payment-account',
      component: () => import('@/views/PaymentAccountView.vue'),
      meta: { requiresAuth: true, title: '支付账户' }
    },
    {
      path: '/customer-service',
      name: 'customer-service',
      component: () => import('@/views/CustomerServiceView.vue'),
      meta: { requiresAuth: true, title: '客服中心' }
    },
    {
      path: '/referral-center',
      name: 'referral-center',
      component: () => import('@/views/ReferralView.vue'),
      meta: { requiresAuth: true, title: '推荐中心' }
    },
    {
      path: '/membership',
      name: 'membership',
      component: () => import('@/views/MembershipView.vue'),
      meta: { requiresAuth: true, title: '会员中心' }
    },
    {
      path: '/security-center',
      name: 'security-center',
      component: () => import('@/views/SecurityCenterView.vue'),
      meta: { requiresAuth: true, title: '安全中心' }
    },
    {
      path: '/change-password',
      name: 'change-password',
      component: () => import('@/views/ChangePasswordView.vue'),
      meta: { requiresAuth: true, title: '修改密码' }
    },
    {
      path: '/change-pin',
      name: 'change-pin',
      component: () => import('@/views/ChangePinView.vue'),
      meta: { requiresAuth: true, title: '修改PIN码' }
    },
    // ========== 404页面 ==========
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('@/views/NotFoundView.vue'),
      meta: { requiresAuth: false, title: '页面未找到' }
    }
  ]
})

// 全局前置守卫
router.beforeEach((to, from, next) => {
  // 获取认证状态
  const authStore = useAuthStore()
  
  // 设置页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - 交易系统`
  }
  
  // 检查路由是否需要认证
  if (to.meta.requiresAuth) {
    if (authStore.isAuthenticated) {
      // 已登录，允许访问
      next()
    } else {
      // 未登录，重定向到登录页
      next({
        path: '/login',
        query: { redirect: to.fullPath } // 保存目标路径，登录后跳转
      })
    }
  } else {
    // 公开页面，但检查是否已登录
    if (to.path === '/login' && authStore.isAuthenticated) {
      // 如果已登录但访问登录页，重定向到首页
      next('/dashboard')
    } else {
      // 允许访问
      next()
    }
  }
})

// 全局后置钩子
router.afterEach((to, from) => {
  // 可以在这里添加页面访问统计
  // 或者处理页面切换后的逻辑
})

export default router