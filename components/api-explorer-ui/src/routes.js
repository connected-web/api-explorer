import * as VueRouter from 'vue-router'

import Home from './pages/Home.vue'
import Icons from './pages/Icons.vue'
import UserDetails from './pages/UserDetails.vue'

import BoardGamesAPI from './pages/BoardGamesAPI.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/extras/icons', component: Icons },
  { path: '/user/details', component: UserDetails },
  { path: '/explore/boardgames-api', component: BoardGamesAPI }
]

const router = VueRouter.createRouter({
  history: VueRouter.createWebHashHistory(),
  routes
})

export default router
