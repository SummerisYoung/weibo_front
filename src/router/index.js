import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
    {
        path: '/',
        name: 'resou',
        component: () => import(/* webpackChunkName: "about" */ '../views/Resou.vue')
    },
    {
        path: '/evolution',
        name: 'evolution',
        component: () => import(/* webpackChunkName: "about" */ '../views/Evolution.vue')
    },
    {
        path: '/spread',
        name: 'spread',
        component: () => import(/* webpackChunkName: "about" */ '../views/Spread.vue')
    },
    {
        path: '/category',
        name: 'category',
        component: () => import(/* webpackChunkName: "about" */ '../views/Category.vue')
    }
]

const router = new VueRouter({
    mode: 'history',
    base: process.env.BASE_URL,
    routes
})

export default router
