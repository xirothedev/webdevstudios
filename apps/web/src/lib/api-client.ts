import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// Track if we're currently refreshing to avoid multiple refresh calls
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

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

// Response interceptor - handle errors and refresh token
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError<{ message?: string; error?: string }>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Handle network errors
    if (!error.response) {
      return Promise.reject({
        message: 'Không thể kết nối đến server. Vui lòng thử lại sau.',
        status: 0,
      });
    }

    const status = error.response.status;
    const data = error.response.data;

    // Handle 401 Unauthorized - try to refresh token
    // Skip refresh logic for refresh endpoint itself to avoid infinite loop
    const isRefreshEndpoint =
      originalRequest.url?.includes('/auth/refresh') ||
      originalRequest.url === '/auth/refresh';

    if (status === 401 && !originalRequest._retry && !isRefreshEndpoint) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Try to refresh token (backend will use cookie if available)
        // Use direct axios call to avoid interceptor loop
        const refreshResponse = await axios.post(
          `${API_URL}/auth/refresh`,
          {},
          {
            withCredentials: true,
          }
        );

        const { accessToken } = refreshResponse.data;

        // Process queued requests
        processQueue(null, accessToken);

        // Retry original request
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed - clear queue
        processQueue(refreshError, null);

        // Only redirect if we're in the browser and not already on login page
        if (typeof window !== 'undefined') {
          const currentPath = window.location.pathname;
          if (!currentPath.startsWith('/auth/login')) {
            // Clear any auth-related state
            window.location.href = '/auth/login';
          }
        }

        return Promise.reject({
          message: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
          status: 401,
        });
      } finally {
        isRefreshing = false;
      }
    }

    // If refresh endpoint returns 401, don't retry - just reject
    if (status === 401 && isRefreshEndpoint) {
      return Promise.reject({
        message: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
        status: 401,
      });
    }

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
