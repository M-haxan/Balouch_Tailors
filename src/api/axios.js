import axios from 'axios';
import useAuthStore from '../Store/authStore';

const API = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || 'https://bt-backend-5d1ec458f8eb.herokuapp.com/api',
  withCredentials: true,
});

API.interceptors.request.use(
  (config) => {
    config.withCredentials = true;
    return config;
  },
  (error) => Promise.reject(error)
);

API.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequestUrl = error.config?.url || '';

    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequestUrl.includes('/auth/login')
    ) {
      useAuthStore.getState().logout();
      if (typeof window !== 'undefined') {
        window.location.href = '/admin/login';
      }
    }

    return Promise.reject(error);
  }
);

export default API;