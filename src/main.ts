import { createApp } from 'vue'

import App from '@/App.vue'
import { registerPlugins } from '@core/utils/plugins'
import keycloak from './services/keycloak';
// Styles
import '@core/scss/template/index.scss'
import '@styles/styles.scss'

// Create vue app
const app = createApp(App)


// Initialize Keycloak
keycloak.init({ 
  onLoad: 'login-required', 
  redirectUri: 'http://127.0.0.1:5173/' // Match this with your Keycloak configuration
}).then((authenticated) => {
  if (authenticated) {
    console.log('User is authenticated');
    // Render the app after successful authentication
    new Vue({
      render: (h) => h(App),
    }).$mount('#app');
  } else {
    console.warn('User is not authenticated');
  }
}).catch((error) => {
  console.error('Failed to initialize Keycloak', error);
});


// Register plugins
registerPlugins(app)

// Mount vue app
app.mount('#app')
