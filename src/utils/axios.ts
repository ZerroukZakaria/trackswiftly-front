import axios from 'axios';
import { keycloak } from '@/services/keycloak';
import Swal from 'sweetalert2';

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

// Add response interceptor to handle errors
// api.interceptors.response.use(
//   (response) => {
//     // If the response is successful, return it as is
//     return response;
//   },
//   async (error) => {
//     const statusCode = error.response?.status;

//     // Handle 401 - Unauthorized
//     if (statusCode === 401) {
//       // Optionally log the user out if 401 error occurs
//       keycloak.logout();
//       Swal.fire({
//         title: 'Session Expired',
//         text: 'Your session has expired, please log in again.',
//         icon: 'warning',
//         confirmButtonText: 'OK',
//         didOpen: () => {
//           document.querySelector('.swal2-confirm').style.color = 'white';
//         }
//       });
//     }
    
//     // Handle other error codes (400, 404, etc.)
//     else if ([400, 404].includes(statusCode)) {
//       let errorMessage = error.response?.data?.message || 'Something went wrong. Please try again.';
      
//       Swal.fire({
//         title: 'Error',
//         text: errorMessage,
//         icon: 'error',
//         confirmButtonText: 'OK',
//         didOpen: () => {
//           document.querySelector('.swal2-confirm').style.color = 'white';
//         }
//       });
//     }

//     // If the error code is not handled, just reject the promise
//     return Promise.reject(error);
//   }
// );

export default api;
