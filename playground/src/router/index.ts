import type { RouteRecordRaw } from 'vue-router';
import { createRouter, createWebHashHistory } from 'vue-router';
const routes: RouteRecordRaw[] = [
  // {
  // path: '/',
  // redirect: '/about',
  // },
  {
    path: '/about',
    component: () => import('../views/about.vue'),
  },
  {
    path: '/home',
    component: () => import('../views/home.vue'),
  },
];
const router = createRouter({
  routes,
  history: createWebHashHistory(),
});
export default router;
