import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Create axios instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Send cookies with requests
});

// Request interceptor - cookies are automatically sent with withCredentials: true
// No need to manually inject tokens since they're in httpOnly cookies
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Cookies are automatically sent by browser
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError<{ message?: string; error?: string }>) => {
    // Handle network errors
    if (!error.response) {
      return Promise.reject({
        message: 'Không thể kết nối đến server. Vui lòng thử lại sau.',
        status: 0,
      });
    }

    const status = error.response.status;
    const data = error.response.data;

    // Extract error message
    let message = data?.message || data?.error || 'Đã xảy ra lỗi';

    // Map status codes to Vietnamese messages
    switch (status) {
      case 400:
        message = data?.message || 'Dữ liệu không hợp lệ';
        break;
      case 401:
        message = data?.message || 'Xác thực thất bại. Vui lòng đăng nhập lại.';
        break;
      case 403:
        message = 'Bạn không có quyền thực hiện hành động này';
        break;
      case 404:
        message = data?.message || 'Không tìm thấy tài nguyên';
        break;
      case 409:
        message = data?.message || 'Dữ liệu đã tồn tại';
        break;
      case 422:
        message = data?.message || 'Dữ liệu không hợp lệ';
        break;
      case 500:
        message = 'Lỗi server. Vui lòng thử lại sau.';
        break;
      default:
        message = data?.message || `Lỗi ${status}: ${error.message}`;
    }

    return Promise.reject({
      message,
      status,
      data: error.response.data,
    });
  }
);
