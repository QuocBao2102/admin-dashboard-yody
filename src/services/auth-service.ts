// import { apiRequest } from './api-client';

// interface AuthResponse {
//   accessToken: string;
//   refreshToken?: string;
//   expiresIn?: number;
//   user?: any;
// }

// interface LoginCredentials {
//   username: string;
//   password: string;
// }

// // Storage keys
// const ACCESS_TOKEN_KEY = 'yody_access_token';
// const REFRESH_TOKEN_KEY = 'yody_refresh_token';
// const USER_DATA_KEY = 'yody_user';

// export const authService = {
//   /**
//    * Login user
//    */
//   login: async (credentials: LoginCredentials) => {
//     const response = await apiRequest<AuthResponse>('POST', '/auth/login', credentials);
    
//     if (response.accessToken) {
//       // Save tokens to localStorage
//       localStorage.setItem(ACCESS_TOKEN_KEY, response.accessToken);
      
//       if (response.refreshToken) {
//         localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);
//       }
      
//       if (response.user) {
//         localStorage.setItem(USER_DATA_KEY, JSON.stringify(response.user));
//       }
//     }
    
//     return response;
//   },
  
//   /**
//    * Logout user
//    */
//   logout: () => {
//     localStorage.removeItem(ACCESS_TOKEN_KEY);
//     localStorage.removeItem(REFRESH_TOKEN_KEY);
//     localStorage.removeItem(USER_DATA_KEY);
    
//     // Reload the page to reset the application state
//     window.location.href = '/signin';
//   },
  
//   /**
//    * Check if user is logged in
//    */
//   isLoggedIn: () => {
//     return !!localStorage.getItem(ACCESS_TOKEN_KEY);
//   },
  
//   /**
//    * Get access token
//    */
//   getAccessToken: () => {
//     return localStorage.getItem(ACCESS_TOKEN_KEY);
//   },
  
//   /**
//    * Get refresh token
//    */
//   getRefreshToken: () => {
//     return localStorage.getItem(REFRESH_TOKEN_KEY);
//   },
  
//   /**
//    * Get user data
//    */
//   getUserData: () => {
//     const userData = localStorage.getItem(USER_DATA_KEY);
//     return userData ? JSON.parse(userData) : null;
//   },
  
//   /**
//    * Refresh token
//    */
//   refreshToken: async () => {
//     const refreshToken = authService.getRefreshToken();
    
//     if (!refreshToken) {
//       throw new Error('No refresh token available');
//     }
    
//     try {
//       const response = await apiRequest<AuthResponse>('POST', '/auth/refresh', {
//         refreshToken
//       });
      
//       if (response.accessToken) {
//         localStorage.setItem(ACCESS_TOKEN_KEY, response.accessToken);
        
//         if (response.refreshToken) {
//           localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);
//         }
//       }
      
//       return response.accessToken;
//     } catch (error) {
//       // If refresh failed, logout user
//       authService.logout();
//       throw error;
//     }
//   }
// };
