import axios from 'axios';
import useAuthStore from '../Store/authStore';

const API = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || 'https://m-haxan-bt-backend.hf.space/api',
  // withCredentials: true, // Isey abhi comment kar dein, JWT headers mein ja raha hai cookies mein nahi
});
const currentToken = useAuthStore.getState().user?.token;
alert(`API Error 401! Token ka status: ${currentToken ? "Token mil gaya tha" : "Token UNDEFINED hai!"}`);
// 🌟 NAYA IZAFA: Request Interceptor (Jate hue Token sath bhejna) 🌟
API.interceptors.request.use(
  (config) => {
    // Zustand store se current state (user data) nikalein
    const state = useAuthStore.getState();
    const token = state.user?.token; // Jo token login ke waqt save hua tha

    // Agar token mojood hai, toh usay har API call ke Header mein attach kar do
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Global Watchman (Response Interceptor - Wapas aate hue error check karna)
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
      // useAuthStore.getState().logout();
      // window.location.href = '/admin/login';
      alert("API Error 401: Backend keh raha hai token masla hai!")
    }
    
    return Promise.reject(error);
  }
  
);

export default API;