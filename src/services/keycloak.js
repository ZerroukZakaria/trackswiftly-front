import Keycloak from 'keycloak-js';

// Initialize Keycloak instance
const keycloak = new Keycloak({
  url: 'https://authserver.obayd.online', // Keycloak server URL
  realm: 'TrackingSwiftlyRealm', // Your realm name
  clientId: 'track-swiftly', // Your client ID
});

export default keycloak;
