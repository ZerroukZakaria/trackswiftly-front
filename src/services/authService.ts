import { keycloak } from './keycloak';

export const handleKeycloakLogin = async () => {
  try {
    await keycloak.init({ onLoad: 'login-required' });

    if (keycloak.authenticated) {
      console.log('Popup: User authenticated, notifying parent window...');
      
      // Notify the main app that authentication was successful
      window.opener?.postMessage('keycloak-authenticated', window.location.origin);

      // Close the popup after authentication
      window.close();
    }
  } catch (error) {
    console.error('Popup: Keycloak authentication failed:', error);
  }
};
