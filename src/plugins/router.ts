import VueRouter from 'vue-router'
import Vue from 'vue'
import routes from '@/routes'

Vue.use(VueRouter)
const router = new VueRouter({
    base: import.meta.env.BASE_URL,
    mode: 'history',
    routes,
})

export default router
