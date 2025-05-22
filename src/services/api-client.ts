import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

// Default base URL if environment variable is not available
const BASE_URL = ['http://api-yody.vutran.id.vn/api'];

// Tạo axios instance với cấu hình đúng
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || BASE_URL[0],
  headers: {
    "Content-Type": "application/json",
    'Accept': 'application/json',
  },
  withCredentials: false, // Tắt withCredentials để tránh lỗi CORS
  timeout: 30000, // Tăng timeout lên 30s
});

// Helper function to validate and format URLs
export function formatImageUrl(url: string): string {
  if (!url) return '';
  
  try {
    // Check if it's already a valid URL
    new URL(url);
    return url;
  } catch (e) {
    // If not a valid URL, try to fix it
    if (url.startsWith('www.')) {
      return `https://${url}`;
    } else if (!url.match(/^https?:\/\//)) {
      return `https://${url}`;
    }
    return url;
  }
}

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    // Log phản hồi trong môi trường phát triển
    if (process.env.NODE_ENV === 'development') {
      console.log('API Response:', response.data);
    }
    return response;
  },
  (error: AxiosError) => {
    if (error.response) {
      // The request was made and server responded with error status
      console.error('API Error Response:', error.response.data);
      console.error('Status code:', error.response.status);
      
      // Log chi tiết hơn trong môi trường phát triển
      if (process.env.NODE_ENV === 'development') {
        console.error('Response headers:', error.response.headers);
        console.error('Request URL:', error.config?.url);
        console.error('Request method:', error.config?.method);
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Không nhận được phản hồi từ server:', error.request);
    } else {
      // Something else caused the error
      console.error('Lỗi khi thiết lập request:', error.message);
    }

    return Promise.reject(error);
  }
);

// Generic API request function 
export async function apiRequest<T>(
  method: string,
  url: string,
  data?: any,
  options?: AxiosRequestConfig
): Promise<T> {
  try {
    const config: AxiosRequestConfig = {
      method,
      url,
      ...options,
    };

    if (data) {
      // Make a deep copy to avoid modifying the original data
      const processedData = {...data};
      
      // Handle image URLs in data
      if (processedData.thumbnailUrl) {
        processedData.thumbnailUrl = formatImageUrl(processedData.thumbnailUrl);
      }
      
      // Ensure thumbnail_url is always set if thumbnailUrl exists
      if (processedData.thumbnailUrl && !processedData.thumbnail_url) {
        processedData.thumbnail_url = processedData.thumbnailUrl;
      }
      
      // Ensure thumbnail_url is properly formatted
      if (processedData.thumbnail_url) {
        processedData.thumbnail_url = formatImageUrl(processedData.thumbnail_url);
      }
      
      // Provide a default image if no image URL is specified
      if (!processedData.thumbnail_url && !processedData.thumbnailUrl) {
        processedData.thumbnail_url = 'https://placehold.co/400x400/EFEFEF/999999?text=No+Image';
      }
      
      // Handle other image URLs
      if (processedData.imageUrl) {
        processedData.imageUrl = formatImageUrl(processedData.imageUrl);
      }
      
      // Clean up undefined values but NOT empty strings for required fields
      Object.keys(processedData).forEach(key => {
        if (processedData[key] === undefined) {
          delete processedData[key];
        }
      });
      
      config.data = processedData;
    }

    // Debug info in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Đang gọi API tới:', url);
      console.log('Cấu hình request:', config);
    }

    const response: AxiosResponse<T> = await apiClient.request<T>(config);
    return response.data;
  } catch (error) {
    // Optionally, you can handle/log the error here
    return Promise.reject(error);
  }
}
