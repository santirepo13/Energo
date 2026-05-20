import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

// Retry 401 once automatically for race condition after login
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only retry GET requests once if they got 401 and haven't been retried yet
    if (error.response?.status === 401 && originalRequest.method === 'get' && !originalRequest._retry) {
      originalRequest._retry = true;
      // Small delay to allow browser cookie storage to propagate
      await new Promise(resolve => setTimeout(resolve, 150));
      return api(originalRequest);
    }

    return Promise.reject(error);
  }
);
