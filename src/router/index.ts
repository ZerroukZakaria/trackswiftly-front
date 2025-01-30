// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router';
import Home from '@/views/Home.vue'; // Adjust the path to your Home component
import keycloak from '@/services/keycloak';

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


router.beforeEach(async (to, from, next) => {
  if (to.meta.requiresAuth) {
    try {
      const authenticated = await keycloak.init({ onLoad: 'check-sso' });
      if (!authenticated) {
        return next({ name: 'login', query: { to: to.fullPath } });
      }
      return next();
    } catch (error) {
      console.error('Keycloak check failed:', error);
      return next({ name: 'login' });
    }
  }
  return next();
});

export default router;
