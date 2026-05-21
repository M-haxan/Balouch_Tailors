import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'react-toastify';
import useAuthStore from '../store/authStore';
import { useNavigate } from 'react-router-dom';

// Axios instance aapke actual Render link ke sath
const API = axios.create({
  baseURL: 'https://bt-backend-dimd.onrender.com/api',
  withCredentials: true, // <-- SAB SE ZAROORI LINE (Iske bina cookies nahi jayengi)
});

export const useLoginMutation = () => {
  const loginSuccess = useAuthStore((state) => state.loginSuccess);
  const navigate = useNavigate();

  return useMutation({
    // 1. Asal API Call jo backend ko hit karegi
    mutationFn: async ({ email, password }) => {
      const response = await API.post('/auth/login', { email, password });
      return response.data; // Backend se user aur token milega
    },
    
    // 2. Agar API successfully respond kare (200 OK)
    onSuccess: (data) => {
      // Zustand store mein data aur token bhejna
      loginSuccess(
        { id: data._id, name: data.name, email: data.email, role: data.role }, 
        data.token
      );
      // Show success toast then navigate to dashboard
      toast.success('Login successful');
      navigate('/admin/dashboard');
    },
    
    // 3. Agar backend koi error de (e.g., 401 Unauthorized)
    onError: (error) => {
      const msg = error.response?.data?.message || error.message || 'Login failed';
      console.error('Login Process Failed:', msg);
      toast.error(msg);
    }
  });
};