
import { createRouter, createWebHashHistory } from "vue-router"

// 使用异步导入避免路径问题
const routes = [
    {
        path: "/",
        name: "Home",
        component: () => import("../../layouts/DefaultLayout.vue")
    },
    {
        path: "/library",
        name: "Library",
        component: () => import("../../layouts/LibraryLayout.vue")
    },
    {
        path:"/User",
        name:"User",
        component:()=>import("../../layouts/UserLayout.vue")
    }
]

const router = createRouter({
    history: createWebHashHistory(),
    routes
})

export default router
