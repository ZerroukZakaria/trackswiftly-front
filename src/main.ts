// main.ts
import { createApp } from 'vue'
import App from '@/App.vue'
import { registerPlugins } from '@core/utils/plugins'
import { keycloak, storeTokens, refreshTokenIfNeeded } from './services/keycloak'
// Styles
import '@core/scss/template/index.scss'
import '@styles/styles.scss'

// Create Vue app
const app = createApp(App)

// Register plugins
registerPlugins(app)

// Initialize Keycloak
keycloak.init({
  onLoad: 'check-sso',  
  checkLoginIframe: false, 
  pkceMethod: 'S256', // Recommended for security
}).then(authenticated => {
  if (authenticated) {
    storeTokens();
    
    console.log('User is authenticated');
    refreshTokenIfNeeded(); 
    
  } else {
    console.log('User is not authenticated');
  }

  app.config.globalProperties.$keycloak = keycloak;
  app.mount('#app');
  
}).catch(error => {
  console.error('Keycloak initialization failed:', error);
});
