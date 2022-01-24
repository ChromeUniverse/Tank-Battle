// router
import { createRouter, createWebHistory } from 'vue-router'

// views
import About from '../views/About.vue'
import Home from '../views/Home.vue'
import Leaderboard from '../views/Leaderboard.vue'
import UserProfile from '../views/UserProfile.vue'
import Play from '../views/Play.vue'
import Login from '../views/Login.vue'
import Logout from '../views/Logout.vue'
import Register from '../views/Register.vue'
import Recover from '../views/Recover.vue'

import store from '@/store.js'

import emitter from '@/emitter.js'

const private_routes = [
  'Leaderboard',
  'Logout',
  'Play',
  'User Profile',
]

const redirect_auth = [
  'Login',
  'Recover',
  'Register',
]

// setup routes
const routes = [
  {
    path: '/about',
    name: 'About',
    component: About,
  },
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/lb',
    name: 'Leaderboard',
    component: Leaderboard,
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
  },
  {
    path: '/logout',
    name: 'Logout',
    component: Logout,
  },
  {
    path: '/play',
    name: 'Play',
    component: Play,
  },
  {
    path: '/recover',
    name: 'Recover',
    component: Recover,
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
  },
  {
    path: '/user',
    name: 'User Profile',
    component: UserProfile,
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

async function auth_test(){
  console.log('Running auth test...');      
  const res = await fetch('/api/user');
  return (res.status == 200 ? true : false);
}

// private routes
router.beforeEach(async (to, from, next) => {
  
  const isAuth = await auth_test();

  store.commit('setAuth', isAuth);
  
  isAuth ? emitter.emit('login') : emitter.emit('logout');

  console.log('Redirect auth?', redirect_auth.includes(to.name));
  console.log('Is user logged in?', isAuth)
  if (private_routes.includes(to.name) && !isAuth) next({ name: 'Login' })
  else if (redirect_auth.includes(to.name) && isAuth) next({ name: 'Home' })
  else next();
});

// // redirect logged in user
// router.beforeEach((to, from, next) => {
  
//   else next();
// })

export default router;
