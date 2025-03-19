// main.ts
import { createApp } from 'vue'
import App from '@/App.vue'
import { registerPlugins } from '@core/utils/plugins'
import { keycloak, storeTokens, refreshTokenIfNeeded } from './services/keycloak'
import { createRouter, createWebHistory } from 'vue-router'

// Styles
import '@core/scss/template/index.scss'
import '@styles/styles.scss'

// Create Vue app
const app = createApp(App)


const router = createRouter({
  history: createWebHistory(),
  routes: [
    // Define your routes here
  ],
})


// Register plugins
registerPlugins(app)

// Initialize Keycloak
keycloak.init({
  onLoad: 'check-sso',  
  checkLoginIframe: false, 
  pkceMethod: 'S256', // Recommended for security
}).then(async (authenticated) => {
  if (authenticated) {
    storeTokens();
    console.log('User is authenticated');
    refreshTokenIfNeeded(); 

    await nextTick(() => {
      const currentRoute = router.currentRoute.value;
      const redirectTo = currentRoute.query.to ? String(currentRoute.query.to) : '/';
      
      // Now navigate using router.replace
      router.replace(redirectTo).catch((error) => {
        console.error('Redirect failed:', error);
      });
    });
    
  } else {
    console.log('User is not authenticated');
  }

  app.config.globalProperties.$keycloak = keycloak;
  app.mount('#app');
  
}).catch(error => {
  console.error('Keycloak initialization failed:', error);
});
