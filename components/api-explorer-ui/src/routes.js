import * as VueRouter from 'vue-router'

import Home from './pages/Home.vue'
import Icons from './pages/Icons.vue'
import UserDetails from './pages/UserDetails.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/extras/icons', component: Icons },
  { path: '/user/details', component: UserDetails }
]

const router = VueRouter.createRouter({
  history: VueRouter.createWebHashHistory(),
  routes
})

export default router
