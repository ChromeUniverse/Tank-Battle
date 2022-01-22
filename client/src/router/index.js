import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Leaderboard from '../views/Leaderboard.vue'
import UserProfile from '../views/UserProfile.vue'
import Play from '../views/Play.vue'
import Login from '../views/Login.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/lb',
    name: 'Leaderboard',
    component: Leaderboard
  },
  {
    path: '/user',
    name: 'User Profile',
    component: UserProfile
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/play',
    name: 'Play',
    component: Play
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router;
