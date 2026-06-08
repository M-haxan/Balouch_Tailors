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
      // API call to login endpoint
      const response = await API.post('/auth/login', { email, password });
      return response.data; 
    },
    
    onSuccess: (data) => {
      loginSuccess(
        { id: data._id, name: data.name, email: data.email, role: data.role }, 
        data.token
      );
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