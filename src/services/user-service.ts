import { UserResponse, User } from '../types/user';
import { apiRequest } from './api-client';

// Define the auth token for API calls
const AUTH_TOKEN = "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbiIsInNjb3BlIjoiUk9MRV9BRE1JTiIsImlzcyI6InlvZHkudm4iLCJleHAiOjE3NDc5MDM0OTcsImlhdCI6MTc0Nzg5OTg5NywidXNlcklkIjoiMTM3OTkwOTMtNWQzZC00ZWUyLWEwYTktOTY1ZTk5ODBhZDg1IiwianRpIjoiOTFjNTRiMmMtM2I5Ni00NTM2LTg1OTItNjU1MjEzZjIyZGE5In0.EeGnyfp0-Ji7AB3nU8X0PHAUOnYFUbF3uiD8MdO2i9bVTUGX9TsRpvNQoBburC10h5_i_aLGKdZDwGBiPcZT3A";

export const userService = {
  /**
   * Get all users with pagination and filtering options
   */
  getAllUsers: async (page = 1, size = 10, filter?: string) => {
    // Build query URL with parameters
    let url = `/identity-service/identity/users`;
    
    // Add pagination if supported by API
    if (page && size) {
      url += `?page=${page - 1}&size=${size}`;
      
      if (filter) {
        url += `&filter=${encodeURIComponent(filter)}`;
      }
    } else if (filter) {
      url += `?filter=${encodeURIComponent(filter)}`;
    }
    
    try {
      console.log(`Calling users endpoint: ${url}`);
      // Include authorization header for this endpoint
      return await apiRequest<UserResponse>('GET', url, undefined, {
        headers: {
          'Authorization': `Bearer ${AUTH_TOKEN}`
        }
      });
    } catch (error) {
      console.error(`Error fetching user data:`, error);
      throw error;
    }
  },

  /**
   * Get user by ID
   */
  getUserById: async (id: string) => {
    return apiRequest<{data: User}>('GET', `/identity-service/identity/users/${id}`, undefined, {
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`
      }
    });
  },

  /**
   * Create a new user
   */
  createUser: async (userData: Partial<User>) => {
    return apiRequest<User>('POST', `/identity-service/identity/users`, userData, {
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`
      }
    });
  },
  
  /**
   * Update a user
   */
  updateUser: async (id: string, userData: Partial<User>) => {
    return apiRequest<User>('PUT', `/identity-service/identity/users/${id}`, userData, {
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`
      }
    });
  },
  
  /**
   * Delete a user
   */
  deleteUser: async (id: string) => {
    return apiRequest<void>('DELETE', `/identity-service/identity/users/${id}`, undefined, {
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`
      }
    });
  }
};
