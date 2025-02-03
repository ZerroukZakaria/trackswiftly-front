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
  realm: 'TrackSwiftlyRealm', // Your realm name
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
    const exp = keycloak.tokenParsed?.exp;
    const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds

    const timeLeft = exp - currentTime;
    const refreshThreshold = 5;

    if (timeLeft <= refreshThreshold) {
      const minValidity = 5;
      const isTokenValid = await keycloak.updateToken(minValidity);

      if (isTokenValid) {
        console.log('Token refreshed');
        storeTokens();
      } else {
        console.log('Token is valid, no need to refresh');
      }
    } else {
      console.log(`Token is valid. ${timeLeft} seconds left.`);
      // Schedule next refresh closer to token expiration
      setTimeout(refreshTokenIfNeeded, (timeLeft - refreshThreshold) * 1000);
    }
  } catch (error) {
    console.error('Error refreshing token:', error);
  }
};


export { keycloak, refreshTokenIfNeeded, storeTokens, removeTokens };
