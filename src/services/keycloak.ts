import Keycloak from 'keycloak-js';

// Define the Keycloak configuration interface
interface KeycloakConfig {
  url: string;
  realm: string;
  clientId: string;
}

// Initialize Keycloak instance
const keycloakConfig: KeycloakConfig = {
  url: 'https://authserver.obayd.online', // Keycloak server URL
  realm: 'TrackingSwiftlyRealm', // Your realm name
  clientId: 'track-swiftly', // Your client ID
};

const keycloak = new Keycloak(keycloakConfig);

export default keycloak;
