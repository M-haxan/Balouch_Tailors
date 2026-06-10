import axios from 'axios';
import useAuthStore from '../Store/authStore';

const API = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || 'https://m-haxan-bt-backend.hf.space/api',
});

// 🌟 BULLETPROOF REQUEST INTERCEPTOR 🌟
API.interceptors.request.use(
  (config) => {
    let token = null;

    try {
      // 1. Seedha LocalStorage se Zustand ki saved state uthao (Bina delay ke)
      const localData = localStorage.getItem('admin-ui-state');
      
      if (localData) {
        const parsedData = JSON.parse(localData);
        // Zustand persist ka data hamesha 'state' ke andar hota hai
        token = parsedData?.state?.user?.token; 
      }

      // 2. Fallback Check: Agar aapne token alag se bhi save kiya hua hai
      if (!token) {
        token = localStorage.getItem('token') || localStorage.getItem('admin-token');
      }

    } catch (e) {
      console.error("LocalStorage read error:", e);
    }

    // Agar token mil gaya hai, toh header mein attach kar do
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
       console.log("Request bheji ja rahi hai, Header mein token ye hai:", config.headers.Authorization);
    
    } else {
      console.warn("Watchman Warning: Token abhi bhi nahi mila!");
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