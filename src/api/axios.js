import axios from 'axios';
import useAuthStore from '../Store/authStore';

const API = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || 'https://m-haxan-bt-backend.hf.space/api',
  withCredentials: true,
});

// 🌟 BULLETPROOF REQUEST INTERCEPTOR 🌟
API.interceptors.request.use(
  (config) => {
    let token = null;

    try {
      const localData = localStorage.getItem('admin-ui-state');

      if (localData) {
        const parsedData = JSON.parse(localData);
        const persistedState = parsedData?.state;
        token = persistedState?.user?.token || persistedState?.token;
      }

      if (!token) {
        token = localStorage.getItem('token') || localStorage.getItem('admin-token');
      }

      if (!token && typeof document !== 'undefined') {
        const cookieMatch = document.cookie.match(/(?:^|; )(?:jwt|token|authToken|accessToken)=([^;]+)/);
        if (cookieMatch) {
          token = decodeURIComponent(cookieMatch[1]);
        }
      }
    } catch (e) {
      console.error('LocalStorage read error:', e);
    }

    config.withCredentials = true;

    if (token) {
      config.headers = {
        ...(config.headers || {}),
        Authorization: `Bearer ${token}`,
      };
      console.log('Request bheji ja rahi hai, Header mein token ye hai:', config.headers.Authorization);
    } else {
      console.warn('Watchman Warning: Token abhi bhi nahi mila, cookie-based auth ka use ho raha hai.');
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Global Watchman (Response Interceptor)
API.interceptors.response.use(
  (response) => {
    return response; 
  },
  (error) => {
    const originalRequestUrl = error.config?.url || '';

    // Agar error 401 hai AUR request login ki nahi hai, tabhi logout karo
    if (
      error.response && 
      error.response.status === 401 && 
      !originalRequestUrl.includes('/auth/login')
    ) {
      // Alert ko temporarily laga rehne dein taake tasalli ho jaye
      alert("API Error 401: Token reject ho gaya!");
      
      useAuthStore.getState().logout();
      window.location.href = '/admin/login';
    }
    
    return Promise.reject(error);
  }
);

export default API;