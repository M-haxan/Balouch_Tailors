import axios from 'axios';
import useAuthStore from '../Store/authStore';

const API = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || 'https://m-haxan-bt-backend.hf.space/api',
  withCredentials: true, 
});

// Global Watchman (Interceptor)
API.interceptors.response.use(
  (response) => {
    return response; 
  },
  (error) => {
    // 1. Check karein ke API kis raste (URL) par hit hui thi
    const originalRequestUrl = error.config?.url;

    // 2. Agar error 401 hai AUR request '/auth/login' KI NAHI HAI, tabhi logout karo
    if (
      error.response && 
      error.response.status === 401 && 
      !originalRequestUrl.includes('/auth/login') // <-- YEH SHART (CONDITION) NAYI HAI
    ) {
      useAuthStore.getState().logout();
      window.location.href = '/admin/login';
    }
    
    // Baqi har error ko aage hook ke paas bhej do
    return Promise.reject(error);
  }
);

export default API;