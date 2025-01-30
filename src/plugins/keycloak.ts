import { Plugin } from 'vue';
import keycloak from '@/services/keycloak';

// Define the Keycloak plugin
const keycloakPlugin: Plugin = {
  async install(app) {
    try {
      // Initialize Keycloak
      const authenticated = await keycloak.init({ onLoad: 'check-sso' });

      if (authenticated) {
        console.log('User is authenticated');
        console.log('Keycloak token:', keycloak.token);
        console.log('User profile:', keycloak.idTokenParsed);

        // Store Keycloak token and user info in localStorage
        localStorage.setItem('keycloakToken', keycloak.token || '');
        localStorage.setItem('keycloakUser', JSON.stringify(keycloak.idTokenParsed));
      } else {
        console.log('User is not authenticated');
      }

      // Add Keycloak instance to the global properties
      app.config.globalProperties.$keycloak = keycloak;
    } catch (error) {
      console.error('Keycloak initialization failed:', error);
    }
  },
};

// Export the plugin as a default function
export default keycloakPlugin;
