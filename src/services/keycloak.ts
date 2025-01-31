import Keycloak from 'keycloak-js';

// Define the Keycloak configuration interface
interface KeycloakConfig {
  url: string;
  realm: string;
  clientId: string;
  redirectUri: string;
  checkLoginIframe: boolean;
  enableLogging: boolean;
}

// Initialize Keycloak instance
const keycloakConfig: KeycloakConfig = {
  url: 'https://authserver.obayd.online', // Keycloak server URL
  realm: 'TrackingSwiftlyRealm', // Your realm name
  clientId: 'track-swiftly', // Your client ID
  redirectUri: window.location.origin,
  checkLoginIframe: false, // Add this
  enableLogging: true // Add this for debugging
};

const keycloak = new Keycloak(keycloakConfig);



const storeTokens = () => {
  localStorage.setItem('access_token', keycloak.token);
  localStorage.setItem('refresh_token', keycloak.refreshToken);
};


const removeTokens = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
}

const refreshTokenIfNeeded = async () => {
  try {
    const minValidity = 5;
    const isTokenValid = await keycloak.updateToken(minValidity);

    if (isTokenValid) {
      console.log('Token refreshed');
      storeTokens(); // Store the new token
    } else {
      console.log('Token is valid, no need to refresh');
    }
  } catch (error) {
    console.error('Error refreshing token:', error);
  }
};




setInterval(refreshTokenIfNeeded, 60000); 
export { keycloak, refreshTokenIfNeeded, storeTokens, removeTokens };
