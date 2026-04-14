
import { createRouter, createWebHashHistory} from "vue-router"
import type {RouteRecordRaw} from "vue-router"


// 定义路由类型
const routes: Array<RouteRecordRaw> = [
  // 公开路由 - 无需登录即可访问
  {
    path: "/auth",
    name: "Auth",
    component: () => import("../../views/AuthView.vue"),
    meta: { requiresAuth: false }
  },

  // 需要登录的主页面路由 - 使用嵌套路由
  {
    path: "/",
    component: () => import("../../layouts/DefaultLayout.vue"),
    meta: { requiresAuth: true },
    children: [
      {
        path: "",
        name: "Home",
        component: () => import("../../views/HomeView.vue")
      }
    ]
  },

  // 其他需要登录的路由

  {
    path: "/user",
    name: "User",
    component: () => import("../../layouts/UserLayout.vue"),
    meta: { requiresAuth: true }
  },
  {
    path: "/AI",
    name: "AI",
    component: () => import("../../layouts/AIEditorLayout.vue"),
    meta: { requiresAuth: true }
  },



  // 重定向未匹配的路由到登录页
  {
    path: "/:pathMatch(.*)*",
    redirect: "/auth"
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// 添加路由守卫
router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const isAuthenticated = localStorage.getItem('token') !== null

  if (requiresAuth && !isAuthenticated) {
    // 需要登录但未登录，重定向到登录页
    next('/auth')
  } else if (!requiresAuth && isAuthenticated && to.path === '/auth') {
    // 已登录但访问登录页，重定向到首页
    next('/')
  } else {
    // 其他情况正常访问
    next()
  }
})

export default router
