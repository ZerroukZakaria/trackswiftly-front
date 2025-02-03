import axios from 'axios';
import { keycloak } from '@/services/keycloak';
const api = axios.create({
  baseURL: 'https://authserver.obayd.online/realms/TrackSwiftlyRealm',
});



// Attach token
api.interceptors.request.use(async (config) => {
  if (keycloak.authenticated) {
    config.headers.Authorization = `Bearer ${keycloak.token}`;
  }
  return config;
}, error => Promise.reject(error));


export default api;
