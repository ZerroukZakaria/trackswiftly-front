// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router';
import Home from '@/views/Home.vue'; // Adjust the path to your Home component

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  // Add other routes here
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
