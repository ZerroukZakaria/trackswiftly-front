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
  redirectUri: 'http://localhost:5173',
  checkLoginIframe: false, // Add this
  enableLogging: true // Add this for debugging
};

const keycloak = new Keycloak(keycloakConfig);

export default keycloak;
