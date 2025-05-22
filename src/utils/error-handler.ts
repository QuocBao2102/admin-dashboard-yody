import axios, { AxiosError } from 'axios';

interface ErrorResponse {
  message?: string;
  statusCode?: number;
  errors?: any;
}

/**
 * Extracts a human-readable error message from various error types
 */
export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ErrorResponse>;
    
    // Get the error message from the response if available
    if (axiosError.response?.data) {
      const { data } = axiosError.response;
      
      if (typeof data === 'string') {
        return data;
      }
      
      if (data.message) {
        return data.message;
      }
      
      if (data.errors && typeof data.errors === 'object') {
        return Object.values(data.errors).join(', ');
      }
    }
    
    // If no specific message in response, return based on status code
    if (axiosError.response) {
      switch (axiosError.response.status) {
        case 400: return 'Bad request: The server cannot process the request';
        case 401: return 'Unauthorized: Please log in to access this resource';
        case 403: return 'Forbidden: You don\'t have permission to access this resource';
        case 404: return 'Not found: The requested resource does not exist';
        case 500: return 'Internal server error: Please try again later';
        default: return `Server error (${axiosError.response.status})`;
      }
    }
    
    // Network error
    if (axiosError.request && !axiosError.response) {
      return 'Network error: Unable to connect to the server';
    }
    
    // Other axios errors
    return axiosError.message || 'An unexpected error occurred';
  }
  
  // Regular Error object
  if (error instanceof Error) {
    return error.message;
  }
  
  // Unknown error type
  return 'An unexpected error occurred';
};

/**
 * Centralized error handler for API calls
 */
export const handleApiError = (error: unknown): never => {
  const message = getErrorMessage(error);
  console.error('API Error:', message, error);
  
  // Handle authentication errors specially
  if (axios.isAxiosError(error) && error.response) {
    if (error.response.status === 401 || error.response.status === 403) {
      // Check if we're already on the sign-in page to avoid redirect loops
      if (!window.location.pathname.includes('/signin')) {
        // Delay redirect slightly to allow error to be handled/displayed first
        setTimeout(() => {
          window.location.href = '/signin';
        }, 1000);
      }
    }
  }
  
  throw new Error(message);
};

/**
 * Check if error is an authentication error
 */
export const isAuthError = (error: unknown): boolean => {
  if (axios.isAxiosError(error) && error.response) {
    return error.response.status === 401 || error.response.status === 403;
  }
  return false;
};
