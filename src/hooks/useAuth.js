// src/hooks/useAuth.js
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import useAuthStore from '../Store/authStore';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios'; 

export const useLoginMutation = () => {
  const loginSuccess = useAuthStore((state) => state.loginSuccess);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async ({ email, password }) => {
      const response = await API.post('/auth/login', { email, password });
      return response.data;
    },

    onSuccess: (data) => {
      const payload = data?.data || data?.result || data;
      const token = payload?.token || payload?.accessToken || payload?.jwt || data?.token || data?.accessToken || data?.jwt || null;
      const userPayload = payload?.user || data?.user || {
        id: payload?._id || data?._id,
        name: payload?.name || data?.name,
        email: payload?.email || data?.email,
        role: payload?.role || data?.role,
      };

      loginSuccess(userPayload, token);
      toast.success('Login successful');
      navigate('/admin/dashboard');
    },

    onError: (error) => {
      const msg = error.response?.data?.message || error.message || 'Login failed';
      console.error('Login Process Failed:', msg);
      toast.error(msg);
    }
  });
};