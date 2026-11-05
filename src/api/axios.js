import axios from 'axios';
import useAuthStore from '../Store/authStore';

const baseURL =
  import.meta.env.VITE_BACKEND_URL ||
  (import.meta.env.DEV
    ? 'http://localhost:3000/api'
    : 'https://bt-backend-5d1ec458f8eb.herokuapp.com/api');

const API = axios.create({
  baseURL,
  withCredentials: true,
});

// A plain client with NO interceptors, used only for the refresh call.
// (If refresh used API, a failing refresh would trigger another refresh forever.)
const refreshClient = axios.create({
  baseURL,
  withCredentials: true,
});

API.interceptors.request.use(
  (config) => {
    config.withCredentials = true;
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// If several requests fail at once, they all wait for ONE refresh call.
let refreshPromise = null;
const requestNewAccessToken = () => {
  if (!refreshPromise) {
    refreshPromise = refreshClient
      .post('/auth/refresh')
      .then((response) => {
        const newToken = response.data.token;
        useAuthStore.getState().setToken(newToken);
        return newToken;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
};

// For these URLs a 401 means "wrong credentials", not "token expired"
const NO_REFRESH_URLS = [
  '/auth/login',
  '/auth/worker-login',
  '/auth/register',
  '/auth/refresh',
  '/auth/logout',
  '/orders/track',
];

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const requestUrl = originalRequest?.url || '';
    const status = error.response?.status;

    const shouldSkip =
      status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      NO_REFRESH_URLS.some((url) => requestUrl.includes(url));

    if (shouldSkip) {
      return Promise.reject(error);
    }

    // Already logged out on this device: nothing to refresh
    if (!useAuthStore.getState().isAuthenticated) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const newToken = await requestNewAccessToken();
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return API(originalRequest); // retry the original request, invisibly
    } catch (refreshError) {
      // Refresh failed: session is really over
      const role = useAuthStore.getState().user?.role;
      useAuthStore.getState().logout();
      if (typeof window !== 'undefined') {
        window.location.href = role === 'worker' ? '/worker/login' : '/admin/login';
      }
      return Promise.reject(error);
    }
  }
);

export default API;