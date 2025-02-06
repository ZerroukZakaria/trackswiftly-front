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
    if (!exp) throw new Error('No token expiration time found');

    const currentTime = Math.floor(Date.now() / 1000);
    const offset = 40; // Buffer to refresh token before actual expiry
    const refreshThreshold = 5;
    const timeLeft = exp - currentTime - offset;


    if (timeLeft <= refreshThreshold) {
      try {
        await keycloak.updateToken(5); // Ensures at least 5s validity
        console.log('Token refreshed successfully');
        storeTokens();
      } catch (refreshError) {
        console.error('Failed to refresh token, logging out:', refreshError);
        keycloak.logout(); // Force logout if refresh fails
        return;
      }
    }

    // Always schedule the next check
    const nextCheck = Math.max(timeLeft - refreshThreshold, 5) * 1000; 
    setTimeout(refreshTokenIfNeeded, nextCheck);
  } catch (error) {
    console.error('Error in refreshTokenIfNeeded:', error);
    setTimeout(refreshTokenIfNeeded, 10000); // Retry after 10 seconds if error
  }
};




export { keycloak, refreshTokenIfNeeded, storeTokens, removeTokens };
